"use client";
import axios from "axios";
import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { TreeDataItem } from "./NestedTagsTree";

const TreeViewComponent = ({
  data,
  onAddChild,
  onExport,
}: {
  data: TreeDataItem | null;
  onAddChild: (parentName: string) => void;
  onExport: () => void;
}) => {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");

  const updateTreeItemData = async (itemId: number, inputVal: string) => {
    try {
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tree/${itemId}/data`,
        { data: inputVal },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        console.log("Successfully updated item data");
      }
    } catch (error) {
      if (error.response && error.response.status === 422) {
        console.error("Validation error:", error.response.data);
      } else {
        console.error("Error updating item data:", error);
      }
    }
  };

  const handleInput = (itemId: number, inputVal: string) => {
    setInput(inputVal);

    // Use a timeout to debounce the update function
    setTimeout(async () => {
      await updateTreeItemData(itemId, inputVal);
    }, 500); // Adjust the delay as needed (500ms in this example)
  };

  useEffect(() => {
    if (data?.data) {
      setInput(data.data);
    }
  }, []);

  if (!data) {
    return <p>Data not found</p>;
  }

  return (
    <div className="border border-blue-500 rounded space-y-2 my-4">
      <div
        className="cursor-pointer font-semibold p-2 rounded-t flex justify-between bg-blue-700 border border-blue-700"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-[8px]">
          <button className="bg-gray-300 px-[12px]  cursor-pointer">
            {expanded ? (
              <ChevronDown />
            ) : (
              <ChevronDown className="rotate-270 transition-all" />
            )}
          </button>
          <p className="select-none text-white">{data.name}</p>
        </div>
        <button
          className="bg-gray-300 text-black p-1 px-2 cursor-pointer rounded min-w-fit"
          onClick={() => onAddChild(data.name)}
        >
          Add Child
        </button>
      </div>
      {expanded && (
        <div className="ml-4 space-y-2">
          {data.children ? (
            data.children.map((child) => (
              <TreeViewComponent
                key={child.id} // Ensure you're using a unique key
                data={child}
                onAddChild={onAddChild}
                onExport={onExport}
              />
            ))
          ) : (
            <div>
              {data.data && (
                <div className="py-2 mr-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => handleInput(data.id, e.target.value)}
                    className="border rounded p-2 w-full"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TreeViewComponent;
