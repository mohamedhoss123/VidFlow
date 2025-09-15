package middleware

import (
	"bytes"
	"io"
	"net/http"
	"time"
	"upload-service/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/sirupsen/logrus"
)

// LoggingMiddleware creates a logging middleware
func LoggingMiddleware(logger *logrus.Logger) gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		logger.WithFields(logrus.Fields{
			"status_code":  param.StatusCode,
			"latency":      param.Latency,
			"client_ip":    param.ClientIP,
			"method":       param.Method,
			"path":         param.Path,
			"user_agent":   param.Request.UserAgent(),
			"error":        param.ErrorMessage,
			"body_size":    param.BodySize,
		}).Info("HTTP Request")
		return ""
	})
}

// CORSMiddleware handles CORS headers
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		c.Header("Access-Control-Expose-Headers", "Content-Length")
		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

// ErrorHandlingMiddleware handles panics and errors
func ErrorHandlingMiddleware(logger *logrus.Logger) gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, recovered interface{}) {
		logger.WithFields(logrus.Fields{
			"panic":  recovered,
			"path":   c.Request.URL.Path,
			"method": c.Request.Method,
		}).Error("Panic recovered")

		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Internal server error",
			Code:    http.StatusInternalServerError,
			Message: "An unexpected error occurred",
		})
	})
}

// RequestSizeLimitMiddleware limits request body size
func RequestSizeLimitMiddleware(maxSize int64) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.ContentLength > maxSize {
			c.JSON(http.StatusRequestEntityTooLarge, models.ErrorResponse{
				Error:   "Request too large",
				Code:    http.StatusRequestEntityTooLarge,
				Message: "Request body exceeds maximum allowed size",
			})
			c.Abort()
			return
		}

		// Limit the request body reader
		c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxSize)
		c.Next()
	}
}

// SecurityHeadersMiddleware adds security headers
func SecurityHeadersMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("X-Content-Type-Options", "nosniff")
		c.Header("X-Frame-Options", "DENY")
		c.Header("X-XSS-Protection", "1; mode=block")
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")
		c.Header("Content-Security-Policy", "default-src 'self'")
		c.Next()
	}
}

// RateLimitMiddleware implements basic rate limiting (simple in-memory)
func RateLimitMiddleware(logger *logrus.Logger) gin.HandlerFunc {
	// Simple in-memory rate limiter
	// In production, use Redis or similar
	clients := make(map[string][]time.Time)
	maxRequests := 100
	window := time.Minute

	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		now := time.Now()

		// Clean old entries
		if requests, exists := clients[clientIP]; exists {
			var validRequests []time.Time
			for _, reqTime := range requests {
				if now.Sub(reqTime) < window {
					validRequests = append(validRequests, reqTime)
				}
			}
			clients[clientIP] = validRequests
		}

		// Check rate limit
		if len(clients[clientIP]) >= maxRequests {
			logger.WithFields(logrus.Fields{
				"client_ip": clientIP,
				"requests":  len(clients[clientIP]),
				"window":    window,
			}).Warn("Rate limit exceeded")

			c.JSON(http.StatusTooManyRequests, models.ErrorResponse{
				Error:   "Rate limit exceeded",
				Code:    http.StatusTooManyRequests,
				Message: "Too many requests, please try again later",
			})
			c.Abort()
			return
		}

		// Add current request
		clients[clientIP] = append(clients[clientIP], now)
		c.Next()
	}
}

// RequestIDMiddleware adds a unique request ID to each request
func RequestIDMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestID := c.GetHeader("X-Request-ID")
		if requestID == "" {
			requestID = generateRequestID()
		}
		c.Header("X-Request-ID", requestID)
		c.Set("request_id", requestID)
		c.Next()
	}
}

// generateRequestID generates a simple request ID
func generateRequestID() string {
	return time.Now().Format("20060102150405") + "-" + randomString(8)
}

// randomString generates a random string of given length
func randomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}

// HealthCheckMiddleware skips logging for health check endpoints
func HealthCheckMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.URL.Path == "/health" || 
		   c.Request.URL.Path == "/health/live" || 
		   c.Request.URL.Path == "/health/ready" {
			c.Set("skip_logging", true)
		}
		c.Next()
	}
}

// RequestBodyLoggerMiddleware logs request bodies for debugging (use carefully)
func RequestBodyLoggerMiddleware(logger *logrus.Logger, enabled bool) gin.HandlerFunc {
	return func(c *gin.Context) {
		if !enabled {
			c.Next()
			return
		}

		// Only log for specific content types and methods
		if c.Request.Method != "POST" && c.Request.Method != "PUT" {
			c.Next()
			return
		}

		contentType := c.GetHeader("Content-Type")
		if contentType != "application/json" {
			c.Next()
			return
		}

		// Read body
		body, err := io.ReadAll(c.Request.Body)
		if err != nil {
			logger.WithError(err).Error("Failed to read request body")
			c.Next()
			return
		}

		// Restore body for further processing
		c.Request.Body = io.NopCloser(bytes.NewBuffer(body))

		// Log body (be careful with sensitive data)
		logger.WithFields(logrus.Fields{
			"method":       c.Request.Method,
			"path":         c.Request.URL.Path,
			"content_type": contentType,
			"body":         string(body),
		}).Debug("Request body")

		c.Next()
	}
}
