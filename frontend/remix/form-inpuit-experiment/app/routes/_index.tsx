import { json, redirect, type ActionFunctionArgs, type MetaFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "User Registration Form" },
    { name: "description", content: "Register user with name, address, and nationality" },
  ];
};

interface ActionData {
  errors?: {
    name?: string;
    address?: string;
    nationality?: string;
  };
  success?: boolean;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const nationality = formData.get("nationality") as string;

  const errors: ActionData["errors"] = {};

  console.log("form submitted");

  // Validate name length
  if (!name || name.length <= 10) {
    errors.name = "Name must be more than 10 characters long";
  }

  // Basic validation for other fields
  if (!address || address.trim().length === 0) {
    errors.address = "Address is required";
  }

  if (!nationality || nationality.trim().length === 0) {
    errors.nationality = "Nationality is required";
  }

  // If there are errors, return them
  if (Object.keys(errors).length > 0) {
    return json<ActionData>({ errors }, { status: 400 });
  }

  // If validation passes, you could save to database here
  console.log("Form submitted successfully:", { name, address, nationality });
  
  return redirect("/thank-you");
  //json<ActionData>({ success: true });
}

export default function Index() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
        <h1>User Registration Form</h1>
        
        {actionData?.success && (
          <div style={{ 
            background: "#d4edda", 
            color: "#155724", 
            padding: "1rem", 
            borderRadius: "0.25rem",
            marginBottom: "1rem"
          }}>
            ✅ Registration successful!
          </div>
        )}

        <Form method="post" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label htmlFor="name" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: actionData?.errors?.name ? "2px solid #dc3545" : "1px solid #ccc",
                borderRadius: "0.25rem",
                fontSize: "1rem"
              }}
              placeholder="Enter your full name (more than 10 characters)"
            />
            {actionData?.errors?.name && (
              <p style={{ color: "#dc3545", margin: "0.5rem 0 0 0", fontSize: "0.875rem" }}>
                {actionData.errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="address" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Address:
            </label>
            <textarea
              id="address"
              name="address"
              rows={3}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: actionData?.errors?.address ? "2px solid #dc3545" : "1px solid #ccc",
                borderRadius: "0.25rem",
                fontSize: "1rem",
                resize: "vertical"
              }}
              placeholder="Enter your full address"
            />
            {actionData?.errors?.address && (
              <p style={{ color: "#dc3545", margin: "0.5rem 0 0 0", fontSize: "0.875rem" }}>
                {actionData.errors.address}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="nationality" style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
              Nationality:
            </label>
            <input
              type="text"
              id="nationality"
              name="nationality"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: actionData?.errors?.nationality ? "2px solid #dc3545" : "1px solid #ccc",
                borderRadius: "0.25rem",
                fontSize: "1rem"
              }}
              defaultValue={"hello earth"}
              placeholder="Enter your nationality"
            />
            {actionData?.errors?.nationality && (
              <p style={{ color: "#dc3545", margin: "0.5rem 0 0 0", fontSize: "0.875rem" }}>
                {actionData.errors.nationality}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              background: isSubmitting ? "#6c757d" : "#007bff",
              color: "white",
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "0.25rem",
              fontSize: "1rem",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              marginTop: "1rem"
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </Form>
      </div>
    </div>
  );
}