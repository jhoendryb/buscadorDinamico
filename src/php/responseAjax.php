<?php
include "./modelo.php";

header("Content-Type: application/json; charset=UTF-8");

$busqueda = $_POST['search'];
$page = $_POST['page'];
$start = ($page - 1) * 10;

$busqueda = (!empty($busqueda) ? "WHERE pc.name LIKE '%{$busqueda}%'" : "");
$consulta = mysqli_query($conexion, "SELECT pc.id, pc.name, pc.country_code, p.name AS pais FROM paisesciudades AS pc INNER JOIN paises AS p ON pc.country_id = p.id {$busqueda} ORDER BY pc.name ASC LIMIT $start, 10");
$consultaRow = mysqli_query($conexion, "SELECT * FROM paisesciudades AS pc {$busqueda} ORDER BY pc.name ASC");
$rowData = mysqli_num_rows($consultaRow);

$newDatos = array();
while ($filas = mysqli_fetch_assoc($consulta)) {
    $newDatos[] = $filas;
}

$response = [
    "data" => $newDatos,
    "page" => (int) $page,
    "countPage" => $rowData
];

mysqli_close($conexion);

echo json_encode($response);
