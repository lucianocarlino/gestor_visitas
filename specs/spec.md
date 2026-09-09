### [Visit manager]

### 1. Context & Goals

* **Problem:** There is a need to replace the manually generated technical maintenance visit reports with a mobile application. It is also necessary to track each replaced machine, including the reason for its replacement, the repair performed, and the final replacement.
* **Solution:** The software offers a menu with the following options: load a form, view the equipment at a location, view existing printheads, view existing brakes, view existing cassettes, statistical data of the jobs performed.
* **Users:** The users are the technicians in charge of carrying out the repairs and replacements, and the company managers.

### 2. Scope & Boundaries

* **Scope:** Main graphical welcome interface and each of the menu options. Login pop-up. A backend exposed via API. Database migration.
* **Boundaries:** Mocked data. Fields for report

### 3. Data & Interfaces

* **Data:** 

class Status(Enum):
PENDING ="Pendiente" 
READY = "Listo"
USING = "En uso"

class CodigoMotivo(Enum):
SRT = "Rutina"
SPR = "Pretemporada"
SPO = "Postemporada"
SOH = "Revision"
UEM = "Emergencia"
UIN = "Instalacion"
URM = "Retirada"
UUP = "Actualizacion"

class CodigoOrden(Enum):
CTR = "Cliente/Operador"
SZR = "Calibrador"
FC = "Condición de fruta"
EWS = "Equipo dentro de especificaciones"
CF = "Fallo de los componentes"
ADJ = "Ajuste necesario"
LF = "Problema con las etiquetas"
LDM = "Recepcion/Alamcenaje de etiquetas"
PD = "Daño fisico"

class CodigoTipoServicio(Enum):
Y = "En emplazamiento"
X = "Taller"
T = "Formacion"

class Vechiculo(Enum):
Amarok = "Amarok"
Chino = "Chino"
Particular = "Particular"

class StatusTecnico(Enum):
DISPONIBLE = "Disponible"
VACACIONES = "Vacaciones"

class Visita:
fecha: Date
motivo: str
solicitado_por: str
id: str
reporte: ReporteSinclair
vehiculo: Vehiculo
tecnico: Tecnico[]
empaque: Empaque

class ItemEstructura:
codigo_res: str
numero_partes: str
cantidad: str
otras_acciones: str
pct_etiquetado_esperado: float
pct_etiquetado_real: float
tiempo_servicio: float

class ReporteSinclair:
visita: Visita
codigo_motivo: CodigoMotivo
codigo_origen: CodigoOrigen
codigo_tipo_servicio: CodigoTipoServicio
estructura: ItemEstructura[]
numero: int
hora_inicio: DateTime
hora_fin: DateTime
fuera_de_hora: bool
comentarios: str
firma_cliente: jpg
nombre_cliente: str
hora_llamada: DateTime
produccion_etiquetada: str
condicion_fruta: str

class Banco:
id: str
fecha_instalacion: Date
lineas: int

class Empaque:
nombre: str
ubicacion: str
latitud: float
longitud: float
servicio: bool
distancia: float
bancos: Banco[]

class Tecnico:
nombre: str
id: str
ultima_conexion: DateTime
estado: StatusTecnico
cumpleaños: Date

class Cabezal (Maquina):
id: str
estado: Status
ubicacion: str

class Casetera: 
id: int
estado: status
ubicacion: str

class Freno:
id: str
fecha_inicio: Date
estado: Status

class Reemplazo: 
fecha: Date
motivo: str
retirado: Cabezal | Casetera
instalado: Cabezal | Casetera
empaque: Empaque

class Cambio:
fecha: Date
motivo: str
lugar: str
retirado: Freno
instalado: Freno
cabezal: Cabezal

class Consumible:
nombre: str
stock: int
id: str

class Servicio: 
fecha: Date
resumen: str
trabajo_hecho: str
consumibles: Consumible[]

* **Interfaces:** 
* * **`IVisitaService` (Visits Management)**
  * `createVisit(vehiculo: Vehiculo, empaque: Empaque, tecnico: Tecnicno, codigo_motivo: CodigoMotivo, codigo_origen: CodigoOrigen, codigo_tipo_servicio: CodigoTipoServicio,, solictado_por: str, motivo: str, hora_inicio: DateTime, hora_fin: DateTime, fuera_de_hora: bool, comentarios: str, estructura: ItemEstructura[], hora_llamada: DateTime, produccion_etiquetada: str = None, condicion_fruta: str = None): ReporteSinclair`
    * **Input:** vehiculo: Vehiculo, empaque: Empaque, tecnico: Tecnicno, codigo_motivo: CodigoMotivo, codigo_origen: CodigoOrigen, codigo_tipo_servicio: CodigoTipoServicio,, solictado_por: str, motivo: str, hora_inicio: DateTime, hora_fin: DateTime, fuera_de_hora: bool, comentarios: str, estructura: ItemEstructura[], hora_llamada: DateTime, produccion_etiquetada: str = None, condicion_fruta: str = None
    * **Return:** `ReporteSinclair` object.

* **`IReeplace` (Replaces management)**
  * `createReeplace(retirado: Cabezal | Casetera, instalado: Cabezal | Casetera, motivo: str) : void`
    * **Input:** `retirado` (Cabezal | Casetera), `instalado` (Cabezal | Casetera), `motivo` (str)
    * **Return:** Cabezal or Casetera from Empaque.

  * `getMachineReplaces(maquina: Cabezal | Casetera): Reemplazo[]`
    * **Input:** `maquina` (Cabezal | Casetera)
    * **Return:** Sorted list of all Reemplazo where machine appears.

* **`IService` (Services management)**
  * `createService(machine: Cabezal | Casetera | Freno, fecha: Date, resumen: str, trabajo_hecho: str, consumibles: Consumible[]): Cabezal | Casetera | Freno`
    * **Input:** `machine` (Cabezal | Casetera | Freno), `fecha` (Date), `resumen` (str), `trabajo_hecho` (str), `consumibles` (Consumible[])
    * **Return:** Machine updated with new Service.

  * `getMachineServices(maquina: Cabezal | Casetera | Freno): Servicio[]`
    * **Input:** `maquina` (Cabezal | Casetera | Freno)
    * **Return:** Sorted list of all Service where machine appears.

* **`ICambio` (Changes management)**
  * `createCambio(cabezal: Cabezal, freno_retirado: Freno, freno_instaldo: Freno, motivo: str, fecha: Date, lugar: str): Freno`
    * **Input:** `machine` (Cabezal | Casetera | Freno), `fecha` (Date), `resumen` (str), `trabajo_hecho` (str), `consumibles` (Consumible[])
    * **Return:** Machine updated with new Cambio.

  * `getFrenoCambios(maquina: Freno): Cambio[]`
    * **Input:** `maquina` (Freno)
    * **Return:** Sorted list of all Cambio where machine appears.

### 4. Features & Edge Cases
* RF01: The system must allow users to record a visit, specifying the vehicle used, who requested the visit, whether it was routine, a more technical reason for the visit, the start and end times, if applicable (if it was after hours), the work performed on-site, and the codes requested by the external company.
* RF02: The system must generate a report as requested by the external company, based on the attached documentation.
* RF03: The system must export the reports generated between two dates to a .zip file.
* RF04: The system must allow users to record a replacement of a packing head or cassette, indicating the new machine being left on-site and the reason for the replacement.
* RF05: The system must allow users to record a service performed on each packing head, cassette, or brake assembly, indicating the work done, and optionally a comment along with a list of consumables.
* RF06: The system must track the historical services performed on each packing head, cassette, and brake assembly.
* RF07: The system must control the stock of consumables.
* RF08: The system must allow for recording a change in a printhead brake assembly, allowing for changes between printheads or for a single brake assembly, and requesting information on the removed assembly, the installed assembly, a reason for the change, and whether it was done on-site or in the workshop.
* RF09: The system must track the current and historical location of each printhead, cassette, and brake assembly.
* RF10: The system must allow the administrator to create, modify, and delete technicians.
* RF11: The system must allow the administrator to create, modify, and delete packaging.
* RF12: The system must allow users to create, modify, and delete cassettes, printheads, and brake assemblies.
* RF13: The system must allow administrators to select consumables as critical.
* RF14: The system must generate alerts about the stock level of critical consumables.
* RF15: The system must generate alerts for users when a packaging has not been visited for more than 15 days.
* RF16: The system must display the movement history for each machine, including date, technician, and reason.
* RF17: The system must display the technician's activity, measured in hours and visits.
* RF18: The system must display the service history for each machine, including technician, summary, and work performed.
* RF19: The system must display the replacement history for each printhead and cassette, including technician, packaging, date, and reason.
* RF20: The system must display the change history for each printhead, including technician, date, reason, and location.
* RF21: The system must allow asynchronous entry of visits.
* RF22: The system must allow a visit to be registered in the mobile application even without internet access.
* RF23: The system must load all pending visits upon connecting to the backend.
* RF24: The system must consist of a backend and a frontend, communicated by two APIs. One for loading visits, and another for the rest of the functionalities.
* RF25: The system must save all the operations made for each user, including the user who made the operation, the operation, the date, and the time.

### 5. Non Functional Features

* **Security**

* RNF01: The system must authenticate users before granting access to its functionalities.

* **Performance**

* RNF02: The system must load the necessary enums for the visit in 10 seconds.

* RNF03: The system must allow loading 3 visits simultaneously.

* RNF04: History queries must be resolved in less than 15 seconds.

* **Availability**

* RNF05: The system must function normally without internet access, except for loading visits.

* **Portability**

* RNF06: The web interface must be responsive and function correctly on mobile devices, tablets, and desktop computers (for loading visits only).

* RNF07: The web interface must function correctly on desktop computers for administrator functions.

* RNF08: The system must be compatible with modern browsers.

* **Maintainability**

* RNF09: The code must follow SOLID principles.

* RNF10: The system design must allow adding more types of machines and operations on them.

* RNF11: The system must allow connection to an external API for the machine provider with the information that he considers relevant.

### 6. Task Breakdown

* [ ] **Task 1:** Define the data types interfaces, and initial validation schemes.

* [ ] **Task 2:** Define the UI for creating Empaques, machines (Cabezal, Casetera and Freno) and Tecnico. Implement the user validation.

* [ ] **Task 3:** Implement the UI for creating Reemplazo, Cambio, and Service. 

* [ ] **Task 4:** Implement the `ICambio`, `IReemplazo`, and `IService` module .

* [ ] **Task 5:** Implement the interface for creating Visita and Reporte.

* [ ] **Task 6:** Implement the `IVisita` module.

* [ ] **Task 7:** Implement the graphics tabs to see the historical movements for machines.

* [ ] **Task 8:** Implement the graphics table to see the historical Visita for Tecnicos.

* [ ] **Task 8:** Integrate the error handling all modules.

* [ ] **Task 9:** Create the docs for all the modules and endpoints that you create
