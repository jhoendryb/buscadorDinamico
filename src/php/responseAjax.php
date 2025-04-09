<?php
error_reporting(E_ALL & ~E_NOTICE & ~E_WARNING);

include "./modelo.php";
header("Content-Type: application/json; charset=UTF-8");

$busqueda = $_POST['searchTerm'];
$page = $_POST['page'];

$start = ($page - 1) * 10;

$busqueda = (!empty($busqueda) ? "WHERE name LIKE '%{$busqueda}%'" : "");
$consulta = mysqli_query($conexion, "SELECT id, name, country_code, country_id FROM paisesciudades {$busqueda} ORDER BY id ASC LIMIT $start, {$_POST['itemsPerPage']}");
$consultaRow = mysqli_query($conexion, "SELECT COUNT(*) AS totalCount FROM paisesciudades {$busqueda} ORDER BY id ASC");
$consultaRow = mysqli_fetch_assoc($consultaRow);

$newDatos = array();
while ($filas = mysqli_fetch_assoc($consulta)) {
    $consultaPais = mysqli_query($conexion, "SELECT name FROM paises WHERE id = '{$filas['country_id']}' LIMIT 1");
    $filas['pais'] = mysqli_fetch_assoc($consultaPais)['name'];
    $newDatos[] = $filas;
}

$response = [
    "test" => "SELECT id, name, country_code, country_id FROM paisesciudades {$busqueda} ORDER BY name ASC LIMIT $start, 10",
    "data" => $newDatos,
    "page" => (int) $page,
    "countPage" => $consultaRow['totalCount']
];

mysqli_close($conexion);

echo json_encode($response);
