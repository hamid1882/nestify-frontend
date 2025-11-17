"use client";

import React, { useState } from "react";
import TreeViewComponent from "./TreeViewComponent";
import axios from "axios";

export interface TreeDataItem {
  id: number; // Unique identifier for the node
  name: string; // Name of the node
  data?: string | null; // Optional data for the node (can be null)
  parent_id?: number | null; // Reference to parent node's ID
  children?: TreeDataItem[] | null; // Optional children nodes
}
const NestedTagsTree = () => {
  const [treeData, setTreeData] = useState<TreeDataItem | null>(null);
  const [exportTreeData, setExportTreeData] = useState(false);

  const fetchTreeData = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tree`
      );
      // Assuming the response data is in an array format
      if (Array.isArray(response.data)) {
        const rootTree = response.data[0];
        setTreeData(rootTree); // Set the state with the updated tree data
      } else {
        console.warn("Unexpected data format:", response.data);
      }
    } catch (error) {
      console.error("Error fetching tree data:", error);
    }
  };

  const replaceTreeData = async (newTreeData: TreeDataItem) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tree`,
        newTreeData as TreeDataItem, // Fix TypeScript type
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        fetchTreeData();
      }
    } catch (error: unknown) {
      // Specify error type as unknown
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        console.error("Validation error:", error.response.data);
      } else {
        console.error("Error replacing tree data:", error);
      }
    }
  };

  React.useEffect(() => {
    fetchTreeData(); // Fetch data on component mount
  }, []);

  const addChild = async (parentName: string) => {
    if (!treeData) return;

    const newChild: Partial<TreeDataItem> = {
      name: `New Child`,
      data: "Data",
    };

    const addChildRecursively = (node: TreeDataItem): boolean => {
      if (node.name === parentName) {
        if (node.data) {
          // Replace 'data' with 'children'
          node.children = [newChild as TreeDataItem];
          delete node.data;
        } else {
          // Add to existing children
          node.children = node.children || [];
          node.children.push(newChild as TreeDataItem);
        }
        return true;
      }

      if (node.children) {
        for (const child of node.children) {
          if (addChildRecursively(child)) {
            return true;
          }
        }
      }

      return false;
    };

    const updatedTree = { ...treeData };
    addChildRecursively(updatedTree);

    // Send to API
    await replaceTreeData(updatedTree);
  };

  const exportTree = async () => {
    await fetchTreeData();
    setExportTreeData(true);
  };

  return (
    <div className="space-y-4">
      <p className="text-2xl font-semibold">Nested Tree:</p>
      <TreeViewComponent
        data={treeData}
        onAddChild={addChild}
        onExport={exportTree}
      />
      <button
        className="bg-gray-300 text-black p-1 px-2 cursor-pointer rounded min-w-fit"
        onClick={exportTree}
      >
        Export
      </button>
      {exportTreeData && <pre>{JSON.stringify(treeData, null, 2)}</pre>}
    </div>
  );
};

export default NestedTagsTree;
