import { UploadVideoDto } from "./upload-video.dto";
import { OmitType, PartialType } from "@nestjs/swagger";

export class UpdateVideoDto extends PartialType(
  OmitType(UploadVideoDto, ["file"] as const),
) {}
