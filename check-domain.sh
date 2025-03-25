#!/bin/bash

# Check domain connectivity for Sparkle & Tidy Experts website

echo "Domain Connectivity Check for Sparkle & Tidy Experts"
echo "=================================================="
echo 

# Check DNS resolution
echo "DNS Resolution:"
echo "--------------"
echo "Checking sparkletidy.com..."
host sparkletidy.com || echo "❌ DNS resolution failed for sparkletidy.com"

echo "Checking www.sparkletidy.com..."
host www.sparkletidy.com || echo "❌ DNS resolution failed for www.sparkletidy.com"
echo 

# Check HTTP connectivity
echo "HTTP Connectivity:"
echo "-----------------"
echo "Checking http://sparkletidy.com..."
curl -s -o /dev/null -w "%{http_code}\n" http://sparkletidy.com
echo "Checking http://www.sparkletidy.com..."
curl -s -o /dev/null -w "%{http_code}\n" http://www.sparkletidy.com
echo 

# Check HTTPS connectivity
echo "HTTPS Connectivity:"
echo "------------------"
echo "Checking https://sparkletidy.com..."
curl -s -o /dev/null -w "%{http_code}\n" https://sparkletidy.com
echo "Checking https://www.sparkletidy.com..."
curl -s -o /dev/null -w "%{http_code}\n" https://www.sparkletidy.com
echo 

# SSL Certificate check
echo "SSL Certificate Verification:"
echo "---------------------------"
echo "Checking sparkletidy.com SSL certificate..."
echo | openssl s_client -servername sparkletidy.com -connect sparkletidy.com:443 2>/dev/null | openssl x509 -noout -dates
echo "Checking www.sparkletidy.com SSL certificate..."
echo | openssl s_client -servername www.sparkletidy.com -connect www.sparkletidy.com:443 2>/dev/null | openssl x509 -noout -dates
echo 

echo "All checks completed!" 