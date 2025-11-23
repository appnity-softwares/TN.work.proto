import prisma from "@/lib/db";
import { getSession } from "@/lib/session";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface Params {
  params: { id: string };
}

export async function POST(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = params.id;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  let uploadedUrl = null;

  if (file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const result: any = await uploadToCloudinary(buffer, "employee-client-logs");
    uploadedUrl = result.secure_url;
  }

  const log = await prisma.clientLog.create({
    data: {
      clientId,
      createdById: session.user.id,
      objective: formData.get("objective") as string,
      demand: formData.get("demand") as string,
      request: formData.get("request") as string,
      response: formData.get("response") as string,
      attachments: uploadedUrl
  ? { file: uploadedUrl }
  : undefined,
    },
  });

  return Response.json({ success: true, log });
}
