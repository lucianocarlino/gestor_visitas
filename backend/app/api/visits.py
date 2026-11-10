from fastapi import APIRouter, HTTPException, Query, Response

from app.schemas.api_contracts import (
    CreateVisitResponse,
    EnumsResponse,
    ExportZipRequest,
    SyncBatchRequest,
    SyncBatchResponse,
)
from app.schemas.domain import CreateVisitDTO, Visita
from app.dependencies.dependencies import VisitServiceDependency

visits_router = APIRouter(prefix="/visits", tags=["visits"])


def _not_implemented() -> None:
    raise HTTPException(status_code=501, detail="Endpoint not implemented")


@visits_router.get("/enums", response_model=EnumsResponse)
async def get_enums() -> EnumsResponse:
    _not_implemented()


@visits_router.post("", response_model=CreateVisitResponse)
async def create_visit(dto: CreateVisitDTO, service: VisitServiceDependency) -> CreateVisitResponse:
    return service.create(dto)


@visits_router.post("/sync-batch", response_model=SyncBatchResponse)
async def sync_batch(payload: SyncBatchRequest, service: VisitServiceDependency) -> SyncBatchResponse:
    return service.sync_batch(payload.visits)


@visits_router.get("", response_model=list[Visita])
async def get_all_visits(service: VisitServiceDependency) -> list[Visita]:
    return service.list_all()


@visits_router.get("/filter/date-range", response_model=list[Visita])
async def filter_by_date_range(
    service: VisitServiceDependency,
    start: str = Query(..., description="Fecha de inicio"),
    end: str = Query(..., description="Fecha de fin")
) -> list[Visita]:
    return service.filter_by_date_range(start, end)


@visits_router.post("/export-zip", response_class=Response)
async def export_zip(payload: ExportZipRequest, service: VisitServiceDependency) -> Response:
    return service.export_zip(payload)


@visits_router.get("/{id}", response_model=Visita)
async def get_visit_by_id(id: str, service: VisitServiceDependency) -> Visita:
    return service.get_by_id(id)
