import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, ArrayMinSize } from "class-validator";
import { Type } from "class-transformer";

class LineItemDto {
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  quantity!: number;

  @IsNumber()
  unitPrice!: number;
}

export class CreateInvoiceDto {
  @IsOptional()
  @IsString()
  invoiceNumber?: string;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsString()
  @IsNotEmpty()
  customerName!: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => LineItemDto)
  lineItems?: LineItemDto[];

  // Optionally allow passing tax percents; controller will compute amounts
  @IsOptional()
  @IsNumber()
  sgstPercent?: number;

  @IsOptional()
  @IsNumber()
  cgstPercent?: number;

  @IsOptional()
  @IsNumber()
  igstPercent?: number;
}