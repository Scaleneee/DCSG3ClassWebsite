import classData from "@/data.json";
import { ClassExperience, type Classmate, type Memory } from "@/components/ClassExperience";

const classmates: Classmate[] = classData.classmates.map((classmate) => ({
  ...classmate,
  photo: classmate.photo.replace("./", ""),
}));

const memories: Memory[] = classData.memories.map((memory) => ({
  ...memory,
  photo: memory.photo.replace("./", ""),
}));

export default function HomePage() {
  return <ClassExperience classmates={classmates} memories={memories} />;
}
