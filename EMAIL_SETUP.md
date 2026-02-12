# EmailJS Configuration Guide

You are now in the control center. Follow these steps to activate the communication system.

## Phase 1: Establish the Comm Link (Service)
1.  Click the blue **Add New Service** button.
2.  Select **Gmail** (Personal) or your preferred email provider.
3.  Click **Connect Account** and authorize it.
    *   *Note: This is the email address that will send the notifications.*
4.  Once created, look for the **Service ID** (it usually looks like `service_xyz123`).
    *   **Action**: Copy this ID.

## Phase 2: Draft the Protocols (Templates)
Click **Email Templates** on the left sidebar. We need to create two templates.

### Template A: Order Confirmation
1.  Click **Create New Template**.
2.  **Subject**: `Mission Acknowledged: Order #{{order_id}}`
3.  **Content** (Copy and paste this):
    ```text
    Operative {{to_name}},

    Your acquisition request has been encrypted and received.
    Reference ID: {{order_id}}

    Manifest:
    {{items_list}}

    Total Allocated: {{total_amount}}

    Secure delivery to:
    {{address}}

    Stand by for dispatch signal.

    - TSS Command
    ```
4.  Save it. Click the **Settings** tab (top of the editor) to find the **Template ID** (e.g., `template_abc123`). Copy it.

### Template B: Shipping Update
1.  Create another template.
2.  **Subject**: `Dispatch Signal: Order #{{order_id}} En Route`
3.  **Content**:
    ```text
    Operative {{to_name}},

    Assets have been deployed.
    Reference ID: {{order_id}}

    Tracking Vector: {{tracking_number}}

    Secure the package immediately upon arrival.

    - TSS Command
    ```
4.  Save and copy its **Template ID**.

## Phase 3: Security Clearance (Public Key)
1.  Click **Account** (or your name) in the bottom left corner.
2.  Look for **Public Key**. Copy it.

## Final Step
Please provide the following 4 values:
1.  **Service ID**
2.  **Order Template ID**
3.  **Shipping Template ID**
4.  **Public Key**

I will then execute the final configuration.
