import cloudinary from "@/lib/cloudinary";
import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  const session = await getSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await req.formData();

  const file = formData.get("file") as File | null;
  const projectId = formData.get("projectId") as string | null;
  const logId = formData.get("logId") as string | null;

  if (!file || !logId) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const uploadResult: any = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "studioTN/clients",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      )
      .end(buffer);
  });

  const savedFile = await prisma.clientLogFile.create({
    data: {
      logId,
      projectId: projectId || null,
      fileUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      fileName: file.name,
      fileType: file.type,
    },
  });

  return Response.json({
    success: true,
    file: savedFile,
  });
}
