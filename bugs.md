1- Deberia implementar algo como una clase superior a reemplazos y cambios para incluir ai movimientos. Hoy el objeto del modelo del dominio movimientos no representa nada util.
2- Al momento de eliminar un empaque, estoy modificando sus maquinas manualmente, esto deberia crear un movimiento. En realidad voy a eliminar los cabezales de momento. Si elimino un empaque es por que las cosas de el no las usare mas. Si no quiero visitar mas un empaque le doy de baja el servicio.
3- De todas formas me falta agregar un movimiento tipo "Retiro" donde los cabezales y caseteras de un empaque pasen al Taller.
~~4- Empaques card: Que no se vea el id, no tiene sentido el calculo de lineas totales~
~5- Al abrir la aplicacion debe aparecer sin sesion, y sin sesion solo se pueden realizar operaciones de visualizacion y nada mas~
6- Al crear un cabezal debo poder crear un freno al mismo tiempo y asignarselo a el cabezal.
~7- Al realizar un reemplazo, cambio de freno o servicio, el tecnico es el que esta logueado.~
8- En la tabla de maquinas, debe haber un renglon por banco del empaque, con el numero de serie como id del banco, ademas de un codigo de motivo distinto por cada uno.
9- En el formulario de visita, Código de motivo no debe aparecer como campo editable, debe ser la lista de Codigos de Motivo de la tabla de maquinas, sin repeticiones 