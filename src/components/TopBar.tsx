import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation } from "react-router-dom";

const routeLabels: Record<string, string> = {
  "/": "Dashboard",
  "/portfolio": "Asset Portfolio",
  "/governance": "Corporate Governance",
  "/financials": "Financials & Reporting",
  "/growth": "Growth & Strategy",
};

const TopBar = () => {
  const location = useLocation();
  const currentLabel = routeLabels[location.pathname] || "Page";
  const isHome = location.pathname === "/";
  const now = new Date();
  const lastUpdated = now.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-foreground" />
        <Breadcrumb>
          <BreadcrumbList>
            {!isHome && (
              <>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </>
            )}
            <BreadcrumbItem>
              <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden text-xs text-muted-foreground sm:block">
          Updated {lastUpdated}
        </span>
      </div>
    </header>
  );
};

export default TopBar;
