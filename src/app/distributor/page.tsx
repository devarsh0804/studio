"use client";

import { useState } from "react";
import { DistributorView } from "./components/DistributorView";
import { DistributorLogin, type DistributorLoginCredentials } from "./components/DistributorLogin";
import { PageHeader } from "@/components/PageHeader";

// In a real app, this would come from a secure source
const VALID_CREDENTIALS = {
  name: "distro",
  code: "1234"
};

export default function DistributorPage() {
  const [distributor, setDistributor] = useState<DistributorLoginCredentials | null>(null);

  const handleLogin = (credentials: DistributorLoginCredentials) => {
    if (credentials.name === VALID_CREDENTIALS.name && credentials.code === VALID_CREDENTIALS.code) {
      setDistributor(credentials);
    } else {
      // In a real app, show an error message
      alert("Invalid credentials!");
    }
  };

  const handleLogout = () => {
    setDistributor(null);
  };

  return (
    <>
      <PageHeader 
        title="Distributor"
        description={distributor ? "Purchase lots and add transport & storage information." : "Please log in to continue."}
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {!distributor ? (
          <DistributorLogin onLogin={handleLogin} />
        ) : (
          <DistributorView distributorId={distributor.name} onLogout={handleLogout} />
        )}
      </main>
    </>
  );
}
