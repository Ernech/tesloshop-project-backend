import { applyDecorators, Type } from "@nestjs/common";
import { ApiOkResponse, ApiProperty, getSchemaPath } from "@nestjs/swagger";

export class PaginatedResponseDTO<T>{
    @ApiProperty({description:'Number of the current page'})
    pageNumber:number;

    @ApiProperty({description:"Current number of requested items"})
    pageSize:number;

    @ApiProperty({description:"Number of total pages"})
    totalPages:number;
    
    items:T[]
}

export function ApiPaginatedResponse<TModel extends Type<any>>(model: TModel) {
  return applyDecorators(
    ApiOkResponse({
      schema: {
        title: `PaginatedResponseOf${model.name}`,
        allOf: [
          { $ref: getSchemaPath(PaginatedResponseDTO) },
          {
            properties: {
              items: {
                type: 'array',
                items: { $ref: getSchemaPath(model) }, // Points directly to GetOrderDTO properties
              },
            },
          },
        ],
      },
    }),
  );
}