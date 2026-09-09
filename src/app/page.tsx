import HomeHeroClient from "@/components/HomeHeroClient";
import { Users, IndianRupee, Leaf } from "lucide-react";

export default async function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-8 lg:space-y-10">
      {/* TWO-COLUMN HERO SECTION WITH FIND A RIDE CARD & REAL INTERACTIVE MAP */}
      <HomeHeroClient />

      {/* BOTTOM FEATURE HIGHLIGHTS BAR */}
      <div className="pt-4 sm:pt-6 border-t">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-2 divide-y md:divide-y-0 md:divide-x divide-border text-center">
          {/* FEATURE 1: VERIFIED USERS */}
          <div className="flex flex-col items-center p-3 space-y-1.5 pt-4 md:pt-2">
            <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-foreground">Verified Users</h3>
            <p className="text-xs text-muted-foreground">
              A safe and trusted student community
            </p>
          </div>

          {/* FEATURE 2: SAVE MONEY */}
          <div className="flex flex-col items-center p-3 space-y-1.5 pt-4 md:pt-2">
            <div className="p-2.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <IndianRupee className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-foreground">Save Money</h3>
            <p className="text-xs text-muted-foreground">
              Split travel costs with peers
            </p>
          </div>

          {/* FEATURE 3: GREENER RIDES */}
          <div className="flex flex-col items-center p-3 space-y-1.5 pt-4 md:pt-2">
            <div className="p-2.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Leaf className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm sm:text-base text-foreground">Greener Rides</h3>
            <p className="text-xs text-muted-foreground">
              Lower emissions, brighter future
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
