<?php
header("Content-Type: application/json; charset=UTF-8");

require __DIR__ . "/modelo.php";

$busqueda = $_POST['searchTerm'];
$page = $_POST['page'];
$sortBy = $_POST['sortBy'] ?? "id_ciudad";
$sortOrder = $_POST['sortOrder'] ?? "asc";

$start = ($page - 1) * 10;

$busqueda = (!empty($busqueda) ? "WHERE ciudad LIKE '%{$busqueda}%'" : "");

$consulta = mysqli_query($conexion, "SELECT id_ciudad, ciudad AS name FROM ciudades {$busqueda} ORDER BY {$sortBy} {$sortOrder} LIMIT $start, {$_POST['itemsPerPage']}");
$consultaRow = mysqli_query($conexion, "SELECT COUNT(*) AS totalCount FROM ciudades {$busqueda} ORDER BY {$sortBy} {$sortOrder}");
$consultaRow = mysqli_fetch_assoc($consultaRow);

$newDatos = array();
while ($filas = mysqli_fetch_assoc($consulta)) {
    $filas['name'] = utf8_encode($filas['name']);
    $newDatos[] = $filas;
}

$response = [
    // "test" => "SELECT id_ciudad, ciudad AS name FROM ciudades {$busqueda} ORDER BY {$sortBy} {$sortOrder} LIMIT $start, {$_POST['itemsPerPage']}",
    "data" => $newDatos,
    // "items" => $newDatos,
    // "page" => (int) $page,
    // "count" => (int) $consultaRow['totalCount']
    "countPage" => (int) $consultaRow['totalCount']
];

mysqli_close($conexion);

echo json_encode($response);
