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
import { useI18n } from "@/i18n/I18nProvider";

// `query` stays in English (jobs are stored in English) — only the visible
// label is translated via `labelKey`.
const CATEGORIES = [
  { query: "Carpenter", labelKey: "trade.carpenter", icon: Hammer },
  { query: "Electrician", labelKey: "trade.electrician", icon: Zap },
  { query: "Plumber", labelKey: "trade.plumber", icon: Wrench },
  { query: "Mason", labelKey: "trade.mason", icon: BrickWall },
  { query: "Factory Worker", labelKey: "trade.factoryWorker", icon: Factory },
  { query: "Machine Operator", labelKey: "trade.machineOperator", icon: Cog },
  { query: "Assembly Line Worker", labelKey: "trade.assemblyLineWorker", icon: Boxes },
  { query: "Delivery Driver", labelKey: "trade.deliveryDriver", icon: Bike },
  { query: "Truck Driver", labelKey: "trade.truckDriver", icon: Truck },
  { query: "Warehouse Worker", labelKey: "trade.warehouseWorker", icon: Warehouse },
  { query: "HVAC Technician", labelKey: "trade.hvacTechnician", icon: AirVent },
  { query: "Auto Mechanic", labelKey: "trade.autoMechanic", icon: Car },
  { query: "Maintenance Worker", labelKey: "trade.maintenanceWorker", icon: Settings },
  { query: "Security Guard", labelKey: "trade.securityGuard", icon: Shield },
  { query: "Driver", labelKey: "trade.driver", icon: CarFront },
  { query: "Construction Worker", labelKey: "trade.constructionWorker", icon: HardHat },
  { query: "Fire Safety Officer", labelKey: "trade.fireSafetyOfficer", icon: FireExtinguisher },
];

/**
 * Browse-by-trade grid. (File name kept from the original carousel it replaced
 * so imports stay stable.)
 */
function CategoryCaraousal() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useI18n();

  const searchJobHandler = (query) => {
    dispatch(setSearchedQuery(query));
    navigate("/jobs");
  };

  return (
    <section aria-labelledby="trades-heading" className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center">
        <h2 id="trades-heading" className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {t("trades.heading")}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {t("trades.subtitle")}
        </p>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {CATEGORIES.map(({ query, labelKey, icon: Icon }) => (
          <button
            key={labelKey}
            type="button"
            onClick={() => searchJobHandler(query)}
            className="group flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-md"
          >
            <Icon
              className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
              aria-hidden="true"
            />
            {t(labelKey)}
          </button>
        ))}
      </div>
    </section>
  );
}

export default CategoryCaraousal;
