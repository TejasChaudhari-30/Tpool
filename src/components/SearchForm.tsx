"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { LocationInput } from "@/components/LocationInput";

export default function SearchForm() {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;

    const params = new URLSearchParams({ origin, destination });
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <LocationInput
          placeholder="Leaving from (e.g. IIIT Pune)"
          value={origin}
          onChange={setOrigin}
          onSelect={(loc) => setOrigin(loc.name)}
          className="w-full"
        />
      </div>
      <div className="flex-1">
        <LocationInput
          placeholder="Going to (e.g. Talegaon Station)"
          value={destination}
          onChange={setDestination}
          onSelect={(loc) => setDestination(loc.name)}
          className="w-full"
        />
      </div>
      <Button type="submit" size="lg" className="w-full md:w-auto">
        <Search className="w-4 h-4 mr-2" />
        Search
      </Button>
    </form>
  );
}
