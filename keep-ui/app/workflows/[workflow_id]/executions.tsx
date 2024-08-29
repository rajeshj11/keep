"use client";
import {
  Callout,
  Card,
  Title,
  Tab,
  TabGroup,
  TabList,
} from "@tremor/react";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import Loading from "../../loading";
import { useRouter } from "next/navigation";
import { useWorkflowExecutionsV2 } from "utils/hooks/useWorkflowExecutions";

import WorkflowGraph from "../workflow-graph";
import { Workflow } from '../models';
import { useWorkflows } from "utils/hooks/useWorkflows";
import { WorkflowSteps } from "../mockworkflows";
import { JSON_SCHEMA, load } from "js-yaml";
import { ExecutionTable } from "./workflow-execution-table";
import SideNavBar from "./side-nav-bar";

const tabs = [
  { name: "All Time", value: 'alltime' },
  { name: "Last 30d", value:"last_30d" },
  { name: "Last 7d", value: "last_7d" },
  { name: "Today", value: "today" },
];

export const FilterTabs = ({
  tabs,
  setTab,
  tab
}: {
  tabs: { name: string; value: string }[];
  setTab: Dispatch<SetStateAction<number>>;
  tab: number;
}) => {

  return (
    <div className="sticky top-0 left-0 max-w-lg space-y-12 pt-6">
      <TabGroup
       index={tab}
       onIndexChange={(index: number) =>{setTab(index)}}
      >
        <TabList variant="solid" color="black" className="bg-gray-300">
          {tabs.map((tabItem, index) => (
            <Tab
              key={tabItem.value}
            >
              {tabItem.name}
            </Tab>
          ))}
        </TabList>
      </TabGroup>
    </div>
  );
};

export function StatsCard({ children }:{children:any}) {
  return <Card className="container flex flex-col p-4 space-y-2">
    {children}
  </Card>
}

interface Pagination {
  limit: number;
  offset: number;
}

export default function WorkflowDetailPage({
  params,
}: {
  params: { workflow_id: string };
}) {
  const router = useRouter();
  const { data: session, status, update } = useSession();
   const { data: workflows } = useWorkflows();
  const workflowData = workflows?.find((wf) => wf.id === params.workflow_id);

  const [executionPagination, setExecutionPagination] = useState<Pagination>({
    limit: 10,
    offset: 0,
  });
  const [tab, setTab] = useState<number>(1)

  useEffect(() => {
    setExecutionPagination({
      limit: 10,
      offset: 0,
    })
  }, [tab]);


  const {
    data,
    isLoading,
    error
  } = useWorkflowExecutionsV2(params.workflow_id, tab, executionPagination.limit, executionPagination.offset);

 
  if (isLoading || !data) return <Loading />;

  if (error) {
    return (
      <Callout
        className="mt-4"
        title="Error"
        icon={ExclamationCircleIcon}
        color="rose"
      >
        Failed to load workflow
      </Callout>
    );
  }
  if (status === "loading" || isLoading || !data) return <Loading />;
  if (status === "unauthenticated") router.push("/signin");

  const parsedWorkflowFile = load(data?.workflow?.workflow_raw ?? '', {
    schema: JSON_SCHEMA,
  }) as any;
  
  const workflow = { last_executions: data.items } as Partial<Workflow>
  return (
    <Card className="relative flex p-4 w-full justify-between gap-8">
        <SideNavBar workflow={data.workflow} />
        <div className="relative flex-1 overflow-auto">
      <FilterTabs tabs={tabs} setTab={setTab} tab={tab}/>
      {data?.items && (
        <div className="mt-2 flex flex-col gap-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2">
            <StatsCard>
              <Title>
                Total Executions
              </Title>
              <div>
                <h1 className="text-2xl font-bold">{data.count ?? 0}</h1>
                <div className="text-sm text-gray-500">__ from last month</div>
              </div>
            </StatsCard>
            <StatsCard>
            <Title>
                Pass / Fail ratio
              </Title>
              <div>
                <h1 className="text-2xl font-bold">{(data.passFail ?? 0).toFixed(2)}{'%'}</h1>
                <div className="text-sm text-gray-500">__ from last month</div>
              </div>
              
            </StatsCard>
            <StatsCard>
            <Title>
                Avg. duration
              </Title>
              <div>
                <h1 className="text-2xl font-bold">{(data.avgDuration ?? 0).toFixed(2)}</h1>
                <div className="text-sm text-gray-500">__ from last month</div>
              </div>
              
            </StatsCard>
            <StatsCard>
            <Title>
                Invloved Services
              </Title>
              <WorkflowSteps workflow={parsedWorkflowFile} />
            </StatsCard>
          </div>
          <WorkflowGraph showLastExecutionStatus={false} workflow={workflow} limit={executionPagination.limit} showAll={true} size="sm" />
          <h1 className="text-xl font-bold mt-4">Execution History</h1>
          <ExecutionTable
            executions={data}
            setPagination={setExecutionPagination}
          />
        </div>
      )}
    </div>
      </Card>
    
  );
}
