import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import AwesomeAlert from "react-native-awesome-alerts";
import { api } from "../hooks/useApiFetch";

type FormPayload = {
  nombre: string;
  telefono: string;
  direccion: string;
  correo: string;
};

export default function FormScreen() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [correo, setCorreo] = useState("");

  const [loading, setLoading] = useState(false);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [cargandoTabla, setCargandoTabla] = useState(false);

  // ALERTA
  const [alerta, setAlerta] = useState({
    visible: false,
    titulo: "",
    mensaje: "",
    tipo: "success",
  });

  const showAlert = (titulo: string, mensaje: string, tipo = "success") => {
    setAlerta({
      visible: true,
      titulo,
      mensaje,
      tipo,
    });
  };

  // Cargar proveedores
  const cargarProveedores = async () => {
    setCargandoTabla(true);

    const { data, error } = await api.get("/consultar");

    setCargandoTabla(false);

    if (error) {
      showAlert("Error", "No se pudieron cargar los proveedores.", "error");
      return;
    }

    setProveedores(data?.data ?? []);
  };

  useEffect(() => {
    cargarProveedores();
  }, []);

  // Guardar proveedor
  const handleSubmit = async () => {
    if (!nombre.trim() || !telefono.trim() || !direccion.trim() || !correo.trim()) {
      showAlert("Formulario incompleto", "Completa todos los campos.", "warning");
      return;
    }

    const payload: FormPayload = { nombre, telefono, direccion, correo };

    setLoading(true);
    const { data, error } = await api.post("/crear", payload);
    setLoading(false);

    if (error) {
      showAlert("Error al guardar", `${error.message}`, "error");
      return;
    }

    showAlert("¡Guardado!", "Proveedor registrado correctamente.", "success");

    setNombre("");
    setTelefono("");
    setDireccion("");
    setCorreo("");

    cargarProveedores();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#4a4e46ff" }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Registrar Proveedor</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre del proveedor"
            placeholderTextColor="#d9d4d2"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="3001234567"
            placeholderTextColor="#d9d4d2"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Dirección</Text>
          <TextInput
            style={styles.input}
            value={direccion}
            onChangeText={setDireccion}
            placeholder="Dirección del proveedor"
            placeholderTextColor="#d9d4d2"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Correo</Text>
          <TextInput
            style={styles.input}
            value={correo}
            onChangeText={setCorreo}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#d9d4d2"
            keyboardType="email-address"
          />
        </View>

        <TouchableOpacity
          style={[styles.submit, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator /> : <Text style={styles.submitText}>Enviar</Text>}
        </TouchableOpacity>

        {/* TABLA */}
        <View style={{ marginTop: 30 }}>
          <Text style={styles.tableTitle}>Proveedores Registrados</Text>

          <TouchableOpacity onPress={cargarProveedores} style={styles.reloadBtn}>
            <Text style={styles.reloadText}>Actualizar tabla</Text>
          </TouchableOpacity>

          {cargandoTabla ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <FlatList
              data={proveedores}
              keyExtractor={(item, index) => String(item.id ?? index)}
              style={{ maxHeight: 300 }}
              renderItem={({ item }) => (
                <View style={styles.row}>
                  <Text style={styles.rowText}>📌 <Text style={styles.bold}>Nombre:</Text> {item.nombre}</Text>
                  <Text style={styles.rowText}><Text style={styles.bold}>Teléfono:</Text> {item.telefono}</Text>
                  <Text style={styles.rowText}><Text style={styles.bold}>Dirección:</Text> {item.direccion}</Text>
                  <Text style={styles.rowText}><Text style={styles.bold}>Correo:</Text> {item.correo}</Text>
                </View>
              )}
            />
          )}
        </View>

        <View style={{ height: 24 }} />

        {/* ALERTA */}
        <AwesomeAlert
          show={alerta.visible}
          title={alerta.titulo}
          message={alerta.mensaje}
          closeOnTouchOutside
          showConfirmButton
          confirmText="OK"
          confirmButtonColor={
            alerta.tipo === "error"
              ? "#D9534F"
              : alerta.tipo === "warning"
              ? "#F0AD4E"
              : "#5CB85C"
          }
          onConfirmPressed={() => setAlerta({ ...alerta, visible: false })}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 32 },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  field: { marginBottom: 14 },
  label: { color: "#fff", marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: "rgba(153, 140, 140, 0.12)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(179, 162, 162, 0.25)",
  },
  submit: {
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitText: { color: "#5d473bff", fontWeight: "700", fontSize: 16 },

  tableTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },

  reloadBtn: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  reloadText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#333",
  },

  row: {
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  rowText: { color: "#fff" },
  bold: { fontWeight: "700" },
});
