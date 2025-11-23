import prisma from "@/lib/db";
import { getSession } from "@/lib/session";
import { uploadToCloudinary } from "@/lib/cloudinary";

interface Params {
  params: { id: string }
}

export async function POST(req: Request, { params }: Params) {
  const session = await getSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const clientId = params.id;
  const formData = await req.formData();

  const file = formData.get("file") as File | null;

  // 1. Upload file if exists
  let uploadedFile: any = null;

  if (file) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    uploadedFile = await uploadToCloudinary(buffer, "clients");
  }

  // 2. Create the client log
  const log = await prisma.clientLog.create({
    data: {
      clientId,
      createdById: session.user.id,
      objective: formData.get("objective") as string,
      demand: formData.get("demand") as string,
      request: formData.get("request") as string,
      response: formData.get("response") as string,
      amount: formData.get("amount")
        ? Number(formData.get("amount"))
        : null,
    },
  });

  // 3. If there's file, create ClientLogFile entry
  if (uploadedFile) {
    await prisma.clientLogFile.create({
      data: {
        logId: log.id,
        fileUrl: uploadedFile.secure_url,
        cloudinaryId: uploadedFile.public_id,
        fileName: file!.name,
        fileType: file!.type,
      },
    });
  }

  return Response.json({ success: true, log });
}
