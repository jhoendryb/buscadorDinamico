<?php
// error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

header("Content-Type: application/json; charset=UTF-8");


require __DIR__ . "/modelo.php";

// var_dump($_POST);
// die();

$busqueda = $_POST['searchTerm'];
$page = $_POST['page'];

$start = ($page - 1) * 10;


$busqueda = (!empty($busqueda) ? "WHERE ciudad LIKE '%{$busqueda}%'" : "");
$consulta = mysqli_query($conexion, "SELECT id_ciudad, ciudad AS name FROM ciudades {$busqueda} ORDER BY id_ciudad ASC LIMIT $start, {$_POST['itemsPerPage']}");
$consultaRow = mysqli_query($conexion, "SELECT COUNT(*) AS totalCount FROM ciudades {$busqueda} ORDER BY id_ciudad ASC");
$consultaRow = mysqli_fetch_assoc($consultaRow);

$newDatos = array();
while ($filas = mysqli_fetch_assoc($consulta)) {
    $filas['name'] = utf8_encode($filas['name']);
    $newDatos[] = $filas;
}

$response = [
    // "test" => "SELECT id_ciudad, ciudad AS name FROM ciudades {$busqueda} ORDER BY id_ciudad ASC LIMIT $start, {$_POST['itemsPerPage']}",
    "data" => $newDatos,
    "page" => (int) $page,
    "countPage" => (int) $consultaRow['totalCount']
];

mysqli_close($conexion);

echo json_encode($response);
