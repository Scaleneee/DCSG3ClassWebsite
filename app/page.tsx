import classData from "@/data.json";
import { ClassExperience, type Classmate } from "@/components/ClassExperience";

const classmates: Classmate[] = classData.classmates.map((classmate) => ({
  ...classmate,
  photo: classmate.photo.replace("./", ""),
}));

export default function HomePage() {
  return <ClassExperience classmates={classmates} />;
}
