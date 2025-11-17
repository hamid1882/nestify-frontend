import Image from "next/image";
import NestifyImage from "@/public/nestify.png";
import TreeViewComponent from "./TreeViewComponent/TreeViewComponent";
import NestedTagsTree from "./TreeViewComponent/NestedTagsTree";

export default function Home() {
  return (
    <div className="container mx-auto">
      <main className="py-12">
        <Image
          className="dark:invert"
          src={NestifyImage}
          alt="Nestify logo"
          width={300}
          height={200}
          priority
        />
        <NestedTagsTree />
      </main>
    </div>
  );
}
