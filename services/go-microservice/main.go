package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func main() {
	// HTTP handler
	http.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
		response := map[string]string{"message": "Hello from the Go microservice!"}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})

	// Health check endpoint for Consul
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	log.Println("🟢 Go microservice listening on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
