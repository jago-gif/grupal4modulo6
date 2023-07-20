import express from "express";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import Jimp from "jimp";

const claveCorrecta = "123";

const argv = yargs(hideBin(process.argv))
  .option("key", {
    describe: "Clave para levantar el servidor",
    demandOption: true,
    type: "string",
    alias: "k",
  })
  .parse();

const app = express();

// Middleware para verificar la clave solo en la ruta de procesamiento de la imagen
const verificarClave = (req, res, next) => {
  if (req.query.key === claveCorrecta) {
    next();
  } else {
    res
      .status(401)
      .send(
        "Clave incorrecta o no se proporcionó la opción 'key'. La solicitud no puede ser procesada."
      );
  }
};
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));


app.get("/", (req, res) => {
  res.sendFile("index.html");
});

app.post("/process", async (req, res) => {
  try {
    console.log(req.body);
    const { imageURL } = req.body;

    // Procesar la imagen con Jimp
    const image = await Jimp.read(imageURL);
    image
      .greyscale() // Convertir a blanco y negro
      .quality(60) // Calidad al 60%
      .resize(350, Jimp.AUTO) // Redimensionar a 350px de ancho
      .write("public/newImg.jpg"); // Guardar la imagen procesada con el nombre "newImg.jpg"

    res.send('<img src="/newImg.jpg" alt="Imagen procesada">'); // Mostrar la imagen procesada en la respuesta
  } catch (error) {
    console.error("Error al procesar la imagen:", error);
    res.status(500).send("Error al procesar la imagen");
  }
});

// Verificar si se proporcionó la opción 'key' y si es correcta antes de iniciar el servidor
if (argv.key === claveCorrecta) {
  app.listen(3000, () => {
    console.log(`Servidor escuchando en el puerto 3000`);
  });
} else {
  console.log(
    "Clave incorrecta o no se proporcionó la opción 'key'. El servidor no se iniciará."
  );
}
