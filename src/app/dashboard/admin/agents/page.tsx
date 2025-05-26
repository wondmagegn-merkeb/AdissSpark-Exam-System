
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, Cpu, Power, PowerOff } from "lucide-react";
import type { AgentEntry } from "@/lib/types"; // Assuming Agent type will be defined

const mockAgents: AgentEntry[] = [
  { id: "agent1", name: "Study Plan Generator", description: "Generates personalized study schedules.", type: "study_planner", status: "active", lastUpdated: new Date(2024, 6, 15) },
  { id: "agent2", name: "FAQ Bot", description: "Answers frequently asked questions about the platform.", type: "faq_bot", status: "active", lastUpdated: new Date(2024, 5, 20) },
  { id: "agent3", name: "Support Chat Agent", description: "Provides real-time support via chat.", type: "support_chat", status: "inactive", lastUpdated: new Date(2024, 4, 10) },
  { id: "agent4", name: "Content Recommender", description: "Suggests relevant study materials.", type: "study_planner", status: "maintenance", lastUpdated: new Date(2024, 6, 22) },
];

export default function ManageAgentsPage() {
  const getStatusVariant = (status: AgentEntry['status']) => {
    if (status === 'active') return 'default'; // Or a green variant if you have one
    if (status === 'inactive') return 'secondary';
    if (status === 'maintenance') return 'outline'; // Or a yellow/orange variant
    return 'default';
  };

  const getStatusIcon = (status: AgentEntry['status']) => {
    if (status === 'active') return <Power className="mr-2 h-4 w-4 text-green-500" />;
    if (status === 'inactive') return <PowerOff className="mr-2 h-4 w-4 text-muted-foreground" />;
    if (status === 'maintenance') return <Cpu className="mr-2 h-4 w-4 text-yellow-500" />; // Example, could be Wrench or Settings2
    return <Cpu className="mr-2 h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Cpu className="mr-3 h-6 w-6 text-primary" /> Manage AI Agents
        </CardTitle>
        <CardDescription>
          Configure, activate, or deactivate AI agents and other automated services.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Agent
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAgents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell>{agent.id}</TableCell>
                <TableCell className="font-medium">{agent.name}</TableCell>
                <TableCell className="capitalize">{agent.type.replace(/_/g, ' ')}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(agent.status)} className="capitalize">
                    {getStatusIcon(agent.status)}
                    {agent.status}
                  </Badge>
                </TableCell>
                <TableCell>{agent.lastUpdated.toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="mr-2">
                    <Edit className="mr-1 h-3 w-3" /> Configure
                  </Button>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-1 h-3 w-3" /> Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {mockAgents.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No agents found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
