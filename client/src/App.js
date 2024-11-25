import React, { useState, useEffect } from "react";

const App = () => {
  const [error, setError] = useState("");
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [companyData, setCompanyData] = useState(null);
  const [directoryData, setDirectoryData] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:4000/api/providers", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        setProviders(data);
        setSelectedProvider(data[0]?.id || "");
      })
      .catch(() => setError("Failed to load providers"));
  }, []);

  const fetchData = async () => {
    try {
      setError("");
      setLoading(true);
      setCompanyData(null);
      setDirectoryData(null);

      const response = await fetch(
        "http://localhost:4000/api/get-access-token",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "Finch-API-Version": "2020-09-17",
          },
          body: JSON.stringify({
            provider_id: selectedProvider,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch data");
      }

      const data = await response.json();
      setCompanyData(data.company);
      setDirectoryData(data.directory?.individuals || []);
      setSelectedEmployee(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/employee/${employeeId}`,
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch employee details");
      }

      const data = await response.json();
      setSelectedEmployee(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Fetch Finch Access Token</h1>

      {/* Provider Selection Dropdown */}
      {providers.length > 0 ? (
        <select
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "16px",
            margin: "10px 0",
            borderRadius: "5px",
          }}
        >
          {providers.map((provider) => (
            <option key={provider.id} value={provider.id}>
              {provider.display_name}
            </option>
          ))}
        </select>
      ) : (
        <p>No providers available. Please try again later.</p>
      )}

      {/* Fetch Button */}
      <button
        onClick={fetchData}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          margin: "10px 6px",
        }}
        disabled={!selectedProvider || loading}
      >
        {loading ? "Loading..." : "Get Information"}
      </button>

      {/* Company Information */}
      {companyData && (
        <div>
          <h3>Company Information:</h3>
          <div
            style={{
              background: "#f9f9f9",
              padding: "15px",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              marginTop: "10px",
            }}
          >
            <p>
              <strong>Company Name:</strong> {companyData.legal_name || "N/A"}
            </p>
            <p>
              <strong>Tax ID (EIN):</strong> {companyData.ein || "N/A"}
            </p>
            <p>
              <strong>Entity Type:</strong> {companyData.entity?.type || "N/A"}
            </p>
            <p>
              <strong>Entity Subtype:</strong>{" "}
              {companyData.entity?.subtype || "N/A"}
            </p>
            <p>
              <strong>Primary Email:</strong>{" "}
              {companyData.primary_email || "N/A"}
            </p>
            <p>
              <strong>Phone Number:</strong>{" "}
              {companyData.primary_phone_number || "N/A"}
            </p>

            {/* Departments */}
            <h4>Departments:</h4>
            <ul>
              {companyData.departments?.map((dept, index) => (
                <li key={index}>
                  {dept.name}{" "}
                  {dept.parent ? `(Parent: ${dept.parent.name})` : ""}
                </li>
              ))}
            </ul>

            {/* Locations */}
            <h4>Locations:</h4>
            <ul>
              {companyData.locations?.map((location, index) => (
                <li key={index}>
                  {location.line1}, {location.line2 && `${location.line2},`}{" "}
                  {location.city}, {location.state} {location.postal_code},{" "}
                  {location.country}
                </li>
              ))}
            </ul>

            {/* Accounts */}
            <h4>Accounts:</h4>
            <ul>
              {companyData.accounts?.map((account, index) => (
                <li key={index}>
                  <strong>
                    {account.account_name} at {account.institution_name}
                  </strong>
                  <br />
                  Account Type: {account.account_type}
                  <br />
                  Routing Number: {account.routing_number}
                  <br />
                  Account Number: {account.account_number}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Employee Directory */}
      {directoryData && directoryData.length > 0 ? (
        <div>
          <h3>Employee Directory:</h3>
          <h4>Total Employees: {directoryData.length}</h4>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {directoryData.map((employee) => (
              <li
                key={employee.id}
                style={{
                  padding: "10px",
                  margin: "5px 0",
                  cursor: "pointer",
                  backgroundColor:
                    selectedEmployee?.id === employee.id
                      ? "#d3f4ff"
                      : "#f4f4f4",
                  borderRadius: "5px",
                  border: "1px solid #ddd",
                }}
                onClick={() => fetchEmployeeDetails(employee.id)}
              >
                {employee.first_name} {employee.last_name}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p></p>
      )}

      {/* Selected Employee Details */}
      {selectedEmployee && (
        <div>
          <h3>Selected Employee:</h3>
          <div
            style={{
              background: "#f9f9f9",
              padding: "15px",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              marginTop: "10px",
            }}
          >
            <p>
              <strong>Name:</strong> {selectedEmployee.first_name}{" "}
              {selectedEmployee.last_name}
            </p>
            <p>
              <strong>Company:</strong> {companyData.legal_name || "N/A"}
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{ color: "red", marginTop: "20px" }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default App;
