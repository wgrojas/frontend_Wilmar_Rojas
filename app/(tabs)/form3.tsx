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

  // ALERTA MODERNA
  const [alerta, setAlerta] = useState({
    visible: false,
    titulo: "",
    mensaje: "",
    tipo: "success",
  });

  const showAlert = (titulo: string, mensaje: string, tipo = "success") => {
    setAlerta({ visible: true, titulo, mensaje, tipo });
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
      style={{ flex: 1, backgroundColor: "#3a3f3b" }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>📋 Registrar Proveedor</Text>

        {/* INPUTS */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={nombre}
            onChangeText={setNombre}
            placeholder="Nombre del proveedor"
            placeholderTextColor="#c7c7c7"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={telefono}
            onChangeText={setTelefono}
            placeholder="3001234567"
            placeholderTextColor="#c7c7c7"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dirección</Text>
          <TextInput
            style={styles.input}
            value={direccion}
            onChangeText={setDireccion}
            placeholder="Dirección del proveedor"
            placeholderTextColor="#c7c7c7"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Correo</Text>
          <TextInput
            style={styles.input}
            value={correo}
            onChangeText={setCorreo}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#c7c7c7"
            keyboardType="email-address"
          />
        </View>

        {/* BOTÓN */}
        <TouchableOpacity
          style={[styles.submit, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Guardar</Text>}
        </TouchableOpacity>

        {/* TABLA */}
        <View style={{ marginTop: 40 }}>
          <Text style={styles.tableTitle}>📄 Proveedores Registrados</Text>

          <TouchableOpacity onPress={cargarProveedores} style={styles.reloadBtn}>
            <Text style={styles.reloadText}>Actualizar lista</Text>
          </TouchableOpacity>

          {cargandoTabla ? (
            <ActivityIndicator size="large" color="#fff" />
          ) : (
            <FlatList
              data={proveedores}
              keyExtractor={(item, index) => String(item.id ?? index)}
              style={{ maxHeight: 350 }}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.cardText}>
                    <Text style={styles.cardLabel}>Nombre:</Text> {item.nombre}
                  </Text>
                  <Text style={styles.cardText}>
                    <Text style={styles.cardLabel}>Teléfono:</Text> {item.telefono}
                  </Text>
                  <Text style={styles.cardText}>
                    <Text style={styles.cardLabel}>Dirección:</Text> {item.direccion}
                  </Text>
                  <Text style={styles.cardText}>
                    <Text style={styles.cardLabel}>Correo:</Text> {item.correo}
                  </Text>
                </View>
              )}
            />
          )}
        </View>

        <AwesomeAlert
          show={alerta.visible}
          title={alerta.titulo}
          message={alerta.mensaje}
          closeOnTouchOutside
          showConfirmButton
          confirmText="Aceptar"
          confirmButtonColor={
            alerta.tipo === "error"
              ? "#e74c3c"
              : alerta.tipo === "warning"
              ? "#f1c40f"
              : "#2ecc71"
          }
          onConfirmPressed={() => setAlerta({ ...alerta, visible: false })}
          titleStyle={{ fontWeight: "800", fontSize: 18 }}
          messageStyle={{ textAlign: "center", fontSize: 16 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 22 },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 20,
  },

  inputGroup: { marginBottom: 16 },
  label: { color: "#fff", fontWeight: "600", marginBottom: 6, fontSize: 15 },

  input: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  submit: {
    backgroundColor: "#6c5ce7",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 17 },

  tableTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },

  reloadBtn: {
    backgroundColor: "#4e44ce",
    padding: 10,
    borderRadius: 10,
    marginBottom: 16,
  },
  reloadText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#fff",
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  cardText: { color: "#fff", marginBottom: 4 },
  cardLabel: { fontWeight: "700", color: "#f9f9f9" },
});
