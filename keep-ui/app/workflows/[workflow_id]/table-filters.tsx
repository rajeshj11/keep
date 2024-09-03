import GenericPopover from "@/components/popover/GenericPopover";
import { Textarea, Badge, Button } from "@tremor/react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useRef, useState, useEffect, ChangeEvent } from "react";
import { GoPlusCircle } from "react-icons/go";


interface TableFiltersProps {
    workflowId: string;
}

type Filters = {
    trigger: string[];
    status: string[];
    execution_id: string;
    [key: string]: any;
}


interface PopoverContentProps {
    options: string[];
    filterRef: React.MutableRefObject<Record<string, string[] | string>>;
    type: string;
}


const status = [
    "success",
    "error",
    "in_progress",
    "timeout",
    "providers_not_configured",
];
const triggers = [
    "scheduler",
    "manual",
    "interval",
    "alert"
]//not usre about the tirgger. in local i am able to get scheduler only. can be used in the future

const PopoverContent: React.FC<PopoverContentProps> = ({ options, filterRef, type }) => {
    // Initialize local state for selected options
    const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set<string>());
    useEffect(() => {
        let value = filterRef.current[type]
        if (Array.isArray(value)) {
            value = filterRef.current[type]
        } else if (value) {
            value = [value]
        } else {
            value = [];
        }
        setSelectedOptions(new Set(value));
    }, [filterRef])

    const handleCheckboxChange = (option: string, checked: boolean) => {
        setSelectedOptions(prev => {
            const updatedOptions = new Set(prev);
            if (checked) {
                updatedOptions.add(option);
            } else {
                updatedOptions.delete(option);
            }
            filterRef.current[type] = Array.from(updatedOptions); // Update ref with array
            return updatedOptions;
        });
    };


    return (
        <>
            <span className="text-gray-400 text-sm">Select {type.charAt(0).toUpperCase() + type.slice(1)}</span>
            <ul className="flex flex-col mt-3 max-h-96 overflow-auto">
                {options.map(option => (
                    <li key={option}>
                        <label className="cursor-pointer p-2 flex items-center">
                            <input
                                className="mr-2"
                                type="checkbox"
                                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                    handleCheckboxChange(option, e.target.checked)
                                }
                                checked={selectedOptions.has(option)}
                            />
                            {option}
                        </label>
                    </li>
                ))}
            </ul>
        </>
    );
};

export const TableFilters: React.FC<TableFiltersProps> = ({ workflowId }) => {
    // Initialize filterRef to store filter values
    const filterRef = useRef<Filters>({ trigger: [], status: [], execution_id: '' });
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [executionId, setExecutionId] = useState('');



    const [apply, setApply] = useState(false);

    useEffect(() => {
        if (apply) {
            const newParams = new URLSearchParams(searchParams ? searchParams.toString() : '');
            newParams.delete('status');
            newParams.delete('execution_id');
            newParams.delete('trigger');

            for (const [key, value] of Object.entries(filterRef.current)) {
                if (Array.isArray(value)) {
                    for (const item of value) {
                        newParams.append(key, item);
                    }
                } else if (value) {
                    newParams.append(key, value);
                }
            }

            router.push(`${pathname}?${newParams.toString()}`);
            setApply(false); // Reset apply state
        }
    }, [apply]);



    useEffect(() => {
        if (searchParams) {
            // Convert URLSearchParams to a key-value pair object
            const params = searchParams.entries().reduce((acc, [key, value]) => {
                if (key in acc) {
                    if (Array.isArray(acc[key])) {
                        acc[key] = [...acc[key], value]
                        return acc;
                    }
                    acc[key] = [acc[key], value];
                    return acc;
                }
                acc[key] = value;
                return acc;
            }, {} as Filters)

            // Update filterRef.current with the new params
            filterRef.current = params as Filters
            setExecutionId(filterRef?.current?.execution_id || '');
        }
    }, [searchParams]); 
    // Handle textarea value change
    const onValueChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        if (filterRef.current) {
            filterRef.current.execution_id = e.target.value || '';
            setExecutionId(e.target.value || '');
        }
    };

    // Handle key down event for textarea
    const handleKeyDown = (e: any) => {
        if (e.key === "Enter") {
            e.preventDefault();
            setApply(true);
        }
    };


    return (
        <div className="relative flex flex-col md:flex-row lg:flex-row gap-4 items-center mb-2">
            <div className="w-1/2 flex relative gap-2 shadow-lg">
                <Textarea
                    rows={1}
                    className="overflow-hidden p-2"
                    value={executionId}
                    onChange={onValueChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter Execution Id..."
                />
                <Badge
                    size="md"
                    color="orange"
                    className="flex-1 absolute right-2 top-1/2 transform -translate-y-1/2" // Position to the far right inside the padding area
                >
                    Enter to apply
                </Badge>
            </div>
            <div className="flex-1 flex gap-4">
                <GenericPopover
                    triggerText="Trigger"
                    triggerIcon={GoPlusCircle}
                    content={<PopoverContent options={triggers} filterRef={filterRef} type="trigger" />}
                    onApply={() => setApply(true)}
                />
                <GenericPopover
                    triggerText="Status"
                    triggerIcon={GoPlusCircle}
                    content={<PopoverContent options={status} filterRef={filterRef} type="status" />}
                    onApply={() => setApply(true)}
                />
            </div>
            <Button className="shadow-lg" onClick={() => {filterRef.current = { trigger: [], status: [], execution_id: '' };setApply(true)}}>Clear Filters</Button>
        </div>
    );
};