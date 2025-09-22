import { type MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "Thank You - Registration Complete" },
    { name: "description", content: "Thank you for registering with us" },
  ];
};

export default function ThankYou() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem", textAlign: "center" }}>
        <h1 style={{ color: "#28a745", fontSize: "2.5rem", marginBottom: "1rem" }}>
          Thank You!
        </h1>
        
        <div style={{ 
          background: "#d4edda", 
          color: "#155724", 
          padding: "2rem", 
          borderRadius: "0.5rem",
          marginBottom: "2rem"
        }}>
          <h2 style={{ margin: "0 0 1rem 0" }}>Registration Successful!</h2>
          <p style={{ margin: "0", fontSize: "1.1rem" }}>
            Your information has been successfully submitted. We appreciate you taking the time to register with us.
          </p>
        </div>

        <Link 
          to="/"
          style={{
            display: "inline-block",
            background: "#007bff",
            color: "white",
            padding: "0.75rem 1.5rem",
            textDecoration: "none",
            borderRadius: "0.25rem",
            fontSize: "1rem"
          }}
        >
          ← Back to Form
        </Link>
      </div>
    </div>
  );
}