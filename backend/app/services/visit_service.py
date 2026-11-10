from datetime import datetime
from app.db.config import PDF_STORAGE_DIR
from app.schemas.api_contracts import CreateVisitResponse, ExportZipRequest, SyncBatchResponse
from app.schemas.domain import CreateVisitDTO, Visita
from app.services.base import DatabaseBackedService
from app.services.pdf_generator import create_visits_zip, save_visit_pdf


class VisitService(DatabaseBackedService):

    def __init__(self, visitas_repository):
        self.visitas_repository = visitas_repository

    def create(self, data: CreateVisitDTO) -> CreateVisitResponse:
        try:
            existing_model = self.visitas_repository.get_visit_by_id(data.id) if data.id else None
            if existing_model and existing_model.reporte:
                return CreateVisitResponse(
                    visita=existing_model.to_domain(),
                    reporte=existing_model.reporte.to_domain(),
                )

            visit_model = existing_model or self.visitas_repository.create_visit(data)
            if not visit_model:
                return CreateVisitResponse.empty()

            report_number = data.numero or f"REP{datetime.now().strftime('%y%m%d%H%M%S')}"
            report_model = self.visitas_repository.create_report(data, visit_model.id, report_number)
            if not report_model:
                return CreateVisitResponse.empty()

            visit_model.reporte = report_model
            new_visit = visit_model.to_domain()
            new_report = report_model.to_domain()

            # Guardar el PDF generado en el servidor
            try:
                save_visit_pdf(
                    visit=new_visit,
                    report_number=new_report.numero,
                    output_dir=PDF_STORAGE_DIR,
                )
            except Exception as pdf_err:
                print(f"Error guardando PDF: {pdf_err}")

            return CreateVisitResponse(visita=new_visit, reporte=new_report)
        except Exception as e:
            print(f"Error creating visit: {e}")
            return CreateVisitResponse.empty()

    def sync_batch(self, visits: list[CreateVisitDTO]) -> SyncBatchResponse:
        response = []
        errors = []
        for visit in visits:
            res = self.create(visit)
            if res.visita:
                response.append(res.visita)
            else:
                errors.append(f"Error sincronizando visita: {visit.id or 'sin-id'}")
        return SyncBatchResponse(synced=response, errors=errors)

    def list_all(self) -> list[Visita]:
        try:
            visits = self.visitas_repository.get_all_visits()
            return [v.to_domain() for v in visits if v and v.reporte]
        except Exception as e:
            print(f"Error listing visits: {e}")
            return []

    def filter_by_date_range(self, start: str, end: str) -> list[Visita]:
        try:
            visits = self.visitas_repository.filter_by_date_range(start, end)
            return [v.to_domain() for v in visits if v and v.reporte]
        except Exception as e:
            print(f"Error filtering visits by date range: {e}")
            return []

    def export_zip(self, filters: ExportZipRequest) -> bytes:
        try:
            if filters.startDate and filters.endDate:
                visits = self.filter_by_date_range(filters.startDate, filters.endDate)
            else:
                visits = self.list_all()
            return create_visits_zip(visits, output_dir=PDF_STORAGE_DIR)
        except Exception as e:
            print(f"Error exporting ZIP: {e}")
            raise e

    def get_by_id(self, visit_id: str) -> Visita | None:
        try:
            model = self.visitas_repository.get_visit_by_id(visit_id)
            return model.to_domain() if model else None
        except Exception as e:
            print(f"Error fetching visit by ID: {e}")
            return None
