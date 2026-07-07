import React from "react";
import {
  Hammer,
  Zap,
  Wrench,
  BrickWall,
  Factory,
  Cog,
  Boxes,
  Bike,
  Truck,
  Warehouse,
  AirVent,
  Car,
  Settings,
  Shield,
  CarFront,
  HardHat,
  FireExtinguisher,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSearchedQuery } from "@/redux/jobSlice";

const CATEGORIES = [
  { label: "Carpenter", icon: Hammer },
  { label: "Electrician", icon: Zap },
  { label: "Plumber", icon: Wrench },
  { label: "Mason", icon: BrickWall },
  { label: "Factory Worker", icon: Factory },
  { label: "Machine Operator", icon: Cog },
  { label: "Assembly Line Worker", icon: Boxes },
  { label: "Delivery Driver", icon: Bike },
  { label: "Truck Driver", icon: Truck },
  { label: "Warehouse Worker", icon: Warehouse },
  { label: "HVAC Technician", icon: AirVent },
  { label: "Auto Mechanic", icon: Car },
  { label: "Maintenance Worker", icon: Settings },
  { label: "Security Guard", icon: Shield },
  { label: "Driver", icon: CarFront },
  { label: "Construction Worker", icon: HardHat },
  { label: "Fire Safety Officer", icon: FireExtinguisher },
];

/**
 * Browse-by-trade grid. (File name kept from the original carousel it replaced
 * so imports stay stable.)
 */
function CategoryCaraousal() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const searchJobHandler = (query) => {
    dispatch(setSearchedQuery(query));
    navigate("/jobs");
  };

  return (
    <section aria-labelledby="trades-heading" className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center">
        <h2 id="trades-heading" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Browse by trade
        </h2>
        <p className="mt-2 text-muted-foreground">
          Jump straight to the work you know best
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {CATEGORIES.map(({ label, icon: Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() => searchJobHandler(label)}
            className="group flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-md"
          >
            <Icon
              className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
              aria-hidden="true"
            />
            {label}
          </button>
        ))}
      </div>
    </section>
  );
}

export default CategoryCaraousal;
