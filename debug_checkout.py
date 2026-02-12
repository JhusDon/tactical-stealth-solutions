
import requests
import json

# Configuration
SHOP_DOMAIN = "tactical-stealth-solutions.myshopify.com"
ACCESS_TOKEN = "c8e83a69303e70ada363fb47762bffce"
VARIANT_ID = "gid://shopify/ProductVariant/53348593041741"

def create_checkout():
    url = f"https://{SHOP_DOMAIN}/api/2023-01/graphql.json"
    headers = {
        "X-Shopify-Storefront-Access-Token": ACCESS_TOKEN,
        "Content-Type": "application/json"
    }
    
    mutation = """
    mutation checkoutCreate($input: CheckoutCreateInput!) {
      checkoutCreate(input: $input) {
        checkout {
          id
          webUrl
        }
        checkoutUserErrors {
          code
          field
          message
        }
      }
    }
    """
    
    variables = {
        "input": {
            "lineItems": [
                {
                    "variantId": VARIANT_ID,
                    "quantity": 1
                }
            ]
        }
    }
    
    response = requests.post(url, headers=headers, json={"query": mutation, "variables": variables})
    
    print(f"Status Code: {response.status_code}")
    try:
        data = response.json()
        print(json.dumps(data, indent=2))
        
        if 'errors' in data:
            print("\n❌ API ERROR:")
            print(data['errors'])
            
        elif data.get('data', {}).get('checkoutCreate', {}).get('checkoutUserErrors'):
            errors = data['data']['checkoutCreate']['checkoutUserErrors']
            if errors:
                print("\n❌ CHECKOUT USER ERRORS:")
                for err in errors:
                    print(f"- {err['message']} ({err['code']})")
            else:
                checkout = data['data']['checkoutCreate']['checkout']
                print("\n✅ CHECKOUT SUCCESS!")
                print(f"Checkout URL: {checkout['webUrl']}")
                
    except Exception as e:
        print(f"Error parsing response: {e}")
        print(response.text)

if __name__ == "__main__":
    print(f"Testing Checkout Creation for {SHOP_DOMAIN}...")
    create_checkout()
