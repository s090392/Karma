import { MoveApply } from "../../move-ui";

export default async function MoveApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MoveApply id={id} />;
}
