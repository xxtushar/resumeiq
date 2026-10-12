import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewDraftForm } from "./new-draft-form";

export default function NewBuilderDraftPage() {
  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Start a new resume</CardTitle>
          <CardDescription>
            Add your notes section by section and let AI draft the wording.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewDraftForm />
        </CardContent>
      </Card>
    </div>
  );
}
