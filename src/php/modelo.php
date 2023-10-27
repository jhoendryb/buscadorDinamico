<?php  
$HOST = "localhost";
$USER = "root";
$PASS = "";
$DB = "pruebas";
$conexion = mysqli_connect($HOST, $USER, $PASS, $DB) or die ("Erro ao conectar ao banco de dados");

// mysqli_query($conexion, "INSERT INTO testing SET descripcion = 'Prueba'");
