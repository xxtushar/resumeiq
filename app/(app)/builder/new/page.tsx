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
            Starts from a sample resume that already scores 90+ on the ATS
            check. Replace it with your details, section by section.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewDraftForm />
        </CardContent>
      </Card>
    </div>
  );
}
