PROTOC := protoc
PROTO_DIR := ../proto
PROTO_FILES := $(wildcard $(PROTO_DIR)/*.proto)

GO_OUT_DIRS := ../optimize-service
TS_OUT_DIRS := ../main-service/src/common/proto
TS_OUT_PROTO := ../main-service/src/
PROTOC_GEN_GO := $(shell go env GOPATH)/bin/protoc-gen-go
PROTOC_GEN_GO_GRPC := $(shell go env GOPATH)/bin/protoc-gen-go-grpc
PROTOC_GEN_TS := node_modules/.bin/protoc-gen-ts_proto

.PHONY: all proto proto-go proto-ts clean install-tools

all: proto

proto: proto-go proto-ts

proto-go: $(PROTO_FILES)
	@echo "Generating Go gRPC code for all proto files..."
	@for dir in $(GO_OUT_DIRS); do \
		mkdir -p $$dir; \
	done
	@for proto in $(PROTO_FILES); do \
		for dir in $(GO_OUT_DIRS); do \
			echo "Generating $$proto -> $$dir"; \
			$(PROTOC) \
				--proto_path=$(PROTO_DIR) \
				--go_out=$$dir \
				--go-grpc_out=$$dir \
				$$proto; \
		done \
	done

proto-ts: $(PROTO_FILES)
	@echo "Generating TypeScript gRPC code for all proto files..."
	@for dir in $(TS_OUT_DIRS); do \
		mkdir -p $$dir; \
	done
	@for proto in $(PROTO_FILES); do \
		for dir in $(TS_OUT_DIRS); do \
			echo "Generating $$proto -> $$dir"; \
			$(PROTOC) \
				--plugin=protoc-gen-ts=$(PROTOC_GEN_TS) \
				--proto_path=$(PROTO_DIR) \
				--ts_out=grpc_nestjs:$$dir \
				$$proto; \
		done; \
	done
	@cp -r $(PROTO_DIR) $(TS_OUT_PROTO)

	
clean:
	@echo "Cleaning generated proto files..."
	@for dir in $(GO_OUT_DIRS); do \
		rm -f $$dir/*.pb.go; \
	done
	@for dir in $(TS_OUT_DIRS); do \
		rm -f $$dir/*.ts; \
	done

install-tools:
	@echo "Installing Go protoc plugins..."
	@go install google.golang.org/protobuf/cmd/protoc-gen-go@latest
	@go install google.golang.org/grpc/cmd/protoc-gen-go-grpc@latest
	@echo "Installing TypeScript protoc plugin..."
	@pnpm i
