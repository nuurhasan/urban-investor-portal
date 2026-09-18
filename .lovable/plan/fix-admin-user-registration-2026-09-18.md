# Fix admin user registration

## Diagnosis
- The registration service is running and the database is healthy.
- Recent requests reached account creation correctly, but one was rejected because the email already exists and another because the temporary password was blocked as compromised.
- The server currently converts these expected validation responses into a generic 500 error, while the page discards the detailed response body. That is why admins only see “Edge Function returned a non-2xx status code.”
- The server is also using an outdated authentication library and manually reading tokens. This will be replaced with current, cryptographically verified token validation.

## Changes
1. Update the admin account-creation function to verify the signed-in admin securely with the current auth library.
2. Return accurate, friendly errors for duplicate emails, weak passwords, invalid sessions, and other validation failures instead of generic 500 responses.
3. Make the User Management page extract and display the server’s actual error message.
4. Apply the same secure token validation to user deletion because it shares the old authentication approach.
5. Deploy the updated functions and test successful creation plus duplicate-email and weak-password failures.

## Expected result
Admins can create pre-approved users normally. If creation is rejected, the form explains exactly what must be corrected rather than showing a generic function error.
