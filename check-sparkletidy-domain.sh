#!/bin/bash

# Domain Connectivity Check Tool for Sparkle & Tidy Experts
# This script checks if your domains are properly configured and accessible

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

VPS_IP=${1:-"YOUR_VPS_IP"}

echo -e "${BLUE}==========================================================${NC}"
echo -e "${BLUE}   Sparkle & Tidy Experts - Domain Connectivity Checker   ${NC}"
echo -e "${BLUE}==========================================================${NC}"
echo

# Check if IP is provided
if [ "$VPS_IP" = "YOUR_VPS_IP" ]; then
    echo -e "${YELLOW}No IP specified. Run with your VPS IP: ${NC}"
    echo -e "${YELLOW}  ./check-sparkletidy-domain.sh YOUR_VPS_IP ${NC}"
    echo -e "${YELLOW}Continuing with general checks...${NC}"
    echo
fi

# Check if host command is available
if ! command -v host &> /dev/null; then
    echo -e "${RED}The 'host' command is not installed. Installing dnsutils...${NC}"
    if command -v apt &> /dev/null; then
        sudo apt update && sudo apt install -y dnsutils
    elif command -v yum &> /dev/null; then
        sudo yum install -y bind-utils
    elif command -v brew &> /dev/null; then
        brew install bind
    else
        echo -e "${RED}Cannot install DNS utilities. Please install dnsutils manually.${NC}"
        exit 1
    fi
fi

# Function to check DNS resolution
check_dns() {
    local domain=$1
    echo -e "${YELLOW}Checking DNS for ${domain}...${NC}"
    
    # Get DNS resolution
    local dns_result=$(host ${domain})
    
    if echo "$dns_result" | grep -q "has address"; then
        echo -e "${GREEN}✓ Domain ${domain} resolves to:${NC}"
        echo "$dns_result" | grep "has address" | awk '{print "  " $4}'
        
        # Check if it resolves to the expected IP
        if [ "$VPS_IP" != "YOUR_VPS_IP" ]; then
            if echo "$dns_result" | grep -q "has address $VPS_IP"; then
                echo -e "${GREEN}✓ Domain resolves to the expected IP: $VPS_IP${NC}"
            else
                echo -e "${RED}✗ Domain does NOT resolve to the expected IP: $VPS_IP${NC}"
                echo -e "${YELLOW}  You may need to update your DNS records or wait for propagation${NC}"
            fi
        fi
    else
        echo -e "${RED}✗ Domain ${domain} does not resolve to an IP address${NC}"
        echo -e "${YELLOW}  Result: ${dns_result}${NC}"
    fi
    echo
}

# Function to check HTTP/HTTPS connectivity
check_http() {
    local domain=$1
    local protocol=$2
    
    echo -e "${YELLOW}Checking ${protocol} connectivity for ${domain}...${NC}"
    
    # Check using curl
    local http_result=$(curl -s -o /dev/null -w "%{http_code}" -m 5 ${protocol}://${domain})
    
    if [ "$http_result" = "000" ]; then
        echo -e "${RED}✗ Cannot connect to ${protocol}://${domain} (Connection failed)${NC}"
    elif [ "$http_result" -ge 200 ] && [ "$http_result" -lt 400 ]; then
        echo -e "${GREEN}✓ ${protocol}://${domain} is accessible (Status code: ${http_result})${NC}"
    else
        echo -e "${RED}✗ ${protocol}://${domain} returned error code: ${http_result}${NC}"
    fi
    
    if [ "$protocol" = "http" ]; then
        # Check for redirect to HTTPS
        local redirect=$(curl -s -o /dev/null -w "%{redirect_url}" -m 5 ${protocol}://${domain})
        if [[ "$redirect" == https://* ]]; then
            echo -e "${GREEN}✓ HTTP redirects to HTTPS correctly${NC}"
        fi
    fi
    echo
}

# Check API connectivity
check_api() {
    local domain=$1
    
    echo -e "${YELLOW}Checking API connectivity for ${domain}...${NC}"
    
    # Try to reach the test endpoint
    local api_result=$(curl -s -m 5 https://${domain}/api/test)
    
    if [ -z "$api_result" ]; then
        echo -e "${RED}✗ API test endpoint at https://${domain}/api/test is not responding${NC}"
    elif echo "$api_result" | grep -q "success"; then
        echo -e "${GREEN}✓ API test endpoint is responding correctly${NC}"
        echo -e "${BLUE}  Response: $(echo $api_result | tr -d '[:cntrl:]')${NC}"
    else
        echo -e "${RED}✗ API test endpoint returned unexpected response${NC}"
        echo -e "${BLUE}  Response: $(echo $api_result | tr -d '[:cntrl:]')${NC}"
    fi
    echo
}

# Main execution starts here
echo -e "${BLUE}Checking Main Domain...${NC}"
check_dns "sparkletidy.com"
check_http "sparkletidy.com" "http"
check_http "sparkletidy.com" "https"

echo -e "${BLUE}Checking WWW Subdomain...${NC}"
check_dns "www.sparkletidy.com"
check_http "www.sparkletidy.com" "http"
check_http "www.sparkletidy.com" "https"

echo -e "${BLUE}Checking API Subdomain...${NC}"
check_dns "api.sparkletidy.com"
check_http "api.sparkletidy.com" "https"
check_api "api.sparkletidy.com"

echo -e "${BLUE}Checking Admin Subdomain...${NC}"
check_dns "admin.sparkletidy.com"
check_http "admin.sparkletidy.com" "http"
check_http "admin.sparkletidy.com" "https"

echo -e "${BLUE}==========================================================${NC}"
echo -e "${BLUE}   Domain Connectivity Check Complete   ${NC}"
echo -e "${BLUE}==========================================================${NC}"
echo
echo -e "If you need to update your DNS settings:"
echo -e "1. Log in to your Hostinger account"
echo -e "2. Go to 'Domains' > 'sparkletidy.com' > 'DNS / Nameservers'"
echo -e "3. Add or update the A records to point to your VPS IP address"
echo
echo -e "Remember that DNS changes can take up to 48 hours to propagate globally."
echo
echo -e "For more help, please consult the full deployment guide:"
echo -e "   SPARKLETIDY_DEPLOYMENT_GUIDE.md"
echo 