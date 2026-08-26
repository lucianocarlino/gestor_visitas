from app.schemas.api_contracts import CreateVisitResponse, ExportZipRequest, SyncBatchResponse
from app.schemas.domain import CreateVisitDTO, Visita
from app.services.base import DatabaseBackedService


class VisitService(DatabaseBackedService):
    async def create(self, data: CreateVisitDTO) -> CreateVisitResponse:
        self._database_operation("create visit and Sinclair report")

    async def sync_batch(self, visits: list[CreateVisitDTO]) -> SyncBatchResponse:
        self._database_operation("create pending visits atomically where possible")

    async def list_all(self) -> list[Visita]:
        self._database_operation("list visits")

    async def filter_by_date_range(self, start: str, end: str) -> list[Visita]:
        self._database_operation(f"list visits between {start} and {end}")

    async def export_zip(self, filters: ExportZipRequest) -> bytes:
        self._database_operation("load reports and generate ZIP archive")

    async def get_by_id(self, visit_id: str) -> Visita:
        self._database_operation(f"find visit {visit_id}")
