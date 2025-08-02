package main

import (
	"fmt"
	"strings"

	"github.com/Kong/go-pdk"
	"github.com/Kong/go-pdk/server"
	"github.com/golang-jwt/jwt/v5"
)

type Config struct {
	Secret string
}

func New() interface{} {
	return &Config{}
}

type Claims struct {
	UserId string `json:"user_id"`
	jwt.RegisteredClaims
}

// ValidateJWT verifies and parses a JWT token
func ValidateJWT(tokenString string, secret string) (*Claims, error) {
	claims := &Claims{}

	// Parse the token
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Verify signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return claims, nil
}

func (config Config) Access(kong *pdk.PDK) {
	token, err := kong.Request.GetHeader("Authorization")
	if err != nil || token == "" {
		kong.Response.Exit(401, []byte("UnAuthorizzed"), make(map[string][]string))
		return
	}
	token = strings.Split(token, " ")[1]
	claims, err := ValidateJWT(token, config.Secret)
	if err != nil {
		kong.Response.Exit(401, []byte("UnAuthorizzed"), make(map[string][]string))
		return
	}
	kong.ServiceRequest.SetHeader("X-User-Id", claims.UserId)
}

func main() {
	Version := "1.1"
	Priority := 1000
	_ = server.StartServer(New, Version, Priority)
}
