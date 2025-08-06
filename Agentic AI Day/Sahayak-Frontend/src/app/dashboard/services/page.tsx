import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Services</h1>
        <p className="text-muted-foreground">Explore additional tools and services.</p>
      </div>
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Service One</CardTitle>
            <CardDescription>Description of the first service.</CardDescription>
          </CardHeader>
          <CardContent>
            <Briefcase className="h-16 w-16 text-muted-foreground" />
            <p className="mt-4">Placeholder content for Service One.</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Service Two</CardTitle>
            <CardDescription>Description of the second service.</CardDescription>
          </CardHeader>
          <CardContent>
            <Briefcase className="h-16 w-16 text-muted-foreground" />
            <p className="mt-4">Placeholder content for Service Two.</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle>Service Three</CardTitle>
            <CardDescription>Description of the third service.</CardDescription>
          </CardHeader>
          <CardContent>
            <Briefcase className="h-16 w-16 text-muted-foreground" />
            <p className="mt-4">Placeholder content for Service Three.</p>
          </CardContent>
        </Card>
       </div>
    </div>
  );
}
