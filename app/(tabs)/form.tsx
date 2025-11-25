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
  View,
  Modal,
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

  // ALERTA GLOBAL
  const [alerta, setAlerta] = useState({
    visible: false,
    titulo: "",
    mensaje: "",
    tipo: "success",
    onConfirm: () => {},
  });

  const showAlert = (
    titulo: string,
    mensaje: string,
    tipo = "success",
    onConfirm = () => {}
  ) => {
    setAlerta({
      visible: true,
      titulo,
      mensaje,
      tipo,
      onConfirm,
    });
  };

  // --------------------------------------------------
  // Cargar proveedores
  // --------------------------------------------------
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

  // --------------------------------------------------
  // GUARDAR
  // --------------------------------------------------
  const handleSubmit = async () => {
    if (!nombre || !telefono || !direccion || !correo) {
      showAlert("Formulario incompleto", "Completa todos los campos.", "warning");
      return;
    }

    const payload: FormPayload = { nombre, telefono, direccion, correo };

    setLoading(true);
    const { error } = await api.post("/crear", payload);
    setLoading(false);

    if (error) {
      showAlert("Error", "No se pudo guardar el proveedor.", "error");
      return;
    }

    showAlert("¡Guardado!", "Proveedor registrado correctamente.");

    setNombre("");
    setTelefono("");
    setDireccion("");
    setCorreo("");

    cargarProveedores();
  };

  // --------------------------------------------------
  // EDITAR
  // --------------------------------------------------
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const openEditModal = (item: any) => {
    setEditData({ ...item });
    setEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editData.nombre || !editData.telefono || !editData.direccion || !editData.correo) {
      showAlert("Campos incompletos", "Todos los campos son obligatorios.", "warning");
      return;
    }

    const { error } = await api.put(`/actualizar/${editData.id}`, editData);

    if (error) {
      showAlert("Error", "No se pudo actualizar.", "error");
      return;
    }

    showAlert("Actualizado", "Proveedor modificado correctamente.");
    setEditModal(false);

    cargarProveedores();
  };

  // --------------------------------------------------
  // ELIMINAR (con confirmación)
  // --------------------------------------------------
  const eliminarProveedor = (id: number) => {
    showAlert(
      "Confirmar eliminación",
      "¿Estás seguro de eliminar este proveedor?",
      "warning",
      async () => {
        const { error } = await api.delete(`/eliminar/${id}`);

        if (error) {
          showAlert("Error", "No se pudo eliminar.", "error");
          return;
        }

        showAlert("Eliminado", "Proveedor eliminado correctamente.");
        cargarProveedores();
      }
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#3a3f3b" }}
      behavior={Platform.select({ ios: "padding" })}
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
            keyboardType="phone-pad"
            placeholderTextColor="#c7c7c7"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dirección</Text>
          <TextInput
            style={styles.input}
            value={direccion}
            onChangeText={setDireccion}
            placeholder="Dirección"
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
            keyboardType="email-address"
            placeholderTextColor="#c7c7c7"
          />
        </View>

        {/* GUARDAR */}
        <TouchableOpacity
          style={[styles.submit, loading && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Guardar</Text>
          )}
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
              keyExtractor={(item) => String(item.id)}
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

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={[styles.btnAction, { backgroundColor: "#0984e3" }]}
                      onPress={() => openEditModal(item)}
                    >
                      <Text style={styles.btnText}>Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.btnAction, { backgroundColor: "#d63031" }]}
                      onPress={() => eliminarProveedor(item.id)}
                    >
                      <Text style={styles.btnText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </View>

        {/* MODAL EDITAR */}
        <Modal visible={editModal} animationType="slide" transparent>
          <View style={styles.modalContainer}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>✏️ Editar Proveedor</Text>

              {editData && (
                <>
                  <TextInput
                    style={styles.modalInput}
                    value={editData.nombre}
                    placeholder="Nombre"
                    onChangeText={(t) => setEditData({ ...editData, nombre: t })}
                    placeholderTextColor="#ccc"
                  />
                  <TextInput
                    style={styles.modalInput}
                    value={editData.telefono}
                    placeholder="Teléfono"
                    onChangeText={(t) =>
                      setEditData({ ...editData, telefono: t })
                    }
                    placeholderTextColor="#ccc"
                  />
                  <TextInput
                    style={styles.modalInput}
                    value={editData.direccion}
                    placeholder="Dirección"
                    onChangeText={(t) =>
                      setEditData({ ...editData, direccion: t })
                    }
                    placeholderTextColor="#ccc"
                  />
                  <TextInput
                    style={styles.modalInput}
                    value={editData.correo}
                    placeholder="Correo"
                    onChangeText={(t) => setEditData({ ...editData, correo: t })}
                    placeholderTextColor="#ccc"
                  />
                </>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#6c5ce7" }]}
                  onPress={handleUpdate}
                >
                  <Text style={styles.modalBtnText}>Guardar cambios</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalBtn, { backgroundColor: "#b2bec3" }]}
                  onPress={() => setEditModal(false)}
                >
                  <Text style={styles.modalBtnText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ALERTA */}
        <AwesomeAlert
          show={alerta.visible}
          title={alerta.titulo}
          message={alerta.mensaje}
          closeOnTouchOutside={true}   // ← FIX IMPORTANTE
          showConfirmButton
          confirmText="Aceptar"
          confirmButtonColor={
            alerta.tipo === "error"
              ? "#e74c3c"
              : alerta.tipo === "warning"
              ? "#f1c40f"
              : "#2ecc71"
          }
          onConfirmPressed={() => {
            const fn = alerta.onConfirm;
            setAlerta({ ...alerta, visible: false });
            fn();
          }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---------------- STYLES --------------- */
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
  },

  submit: {
    backgroundColor: "#6c5ce7",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 17 },

  tableTitle: { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 10 },

  reloadBtn: { backgroundColor: "#4e44ce", padding: 10, borderRadius: 10, marginBottom: 16 },
  reloadText: { textAlign: "center", fontWeight: "700", color: "#fff" },

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

  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  btnAction: {
    padding: 10,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700" },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    backgroundColor: "#2d3436",
    padding: 20,
    borderRadius: 14,
  },
  modalTitle: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 14 },
  modalInput: {
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "#fff",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },

  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  modalBtn: { padding: 12, borderRadius: 10, width: "48%" },
  modalBtnText: { textAlign: "center", color: "#fff", fontWeight: "700" },
});
