import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "../../config/firebase";
import { signOut } from "firebase/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import banner from "../../assets/images/banner.jpeg";
import AddProfileModal from "../../components/profiles/AddProfileModal";
import EditProfileModal from "../../components/profiles/EditProfileModal";
import NotificationIndicator from "../../components/notifications/NotificationIndicator";
import { NotificationScheduler } from "../../services/notificationScheduler";

function ProfileSelection() {
  const [tutorName, setTutorName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const navigate = useNavigate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);

  const fetchProfiles = async (userId) => {
    try {
      console.log("Fetching profiles for user:", userId);
      const profilesSnapshot = await getDocs(
        query(collection(db, "childProfiles"), where("tutorId", "==", userId))
      );

      const profilesList = profilesSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          birthDate: data.birthDate || "",
        };
      });

      console.log("Profiles fetched:", profilesList);
      setProfiles(profilesList);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Error al cargar los perfiles");
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      const fetchData = async () => {
        try {
          const tutorDoc = await getDoc(doc(db, "tutors", user.uid));
          if (tutorDoc.exists()) {
            setTutorName(tutorDoc.data().fullName);
          }
          await fetchProfiles(user.uid);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleCreateProfile = async (profileData) => {
    try {
      const userId = auth.currentUser.uid; //obtiene el id del usuario actual

      const existingProfiles = await getDocs(
        query(
          collection(db, "childProfiles"),
          where("tutorId", "==", userId),
          where("fullName", "==", profileData.fullName)
        )
      );

      if (!existingProfiles.empty) {
        toast.error("Ya existe un perfil con este nombre");
        return;
      }

      // Generar iniciales y color para el avatar
      const initials = profileData.fullName
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);

      const generatePastelColor = () => {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 70%, 80%)`;
      };

      const docRef = await addDoc(collection(db, "childProfiles"), {
        ...profileData,
        avatar: {
          initials,
          color: generatePastelColor(),
        },
        birthDate: profileData.birthDate,
        tutorId: userId,
        createdAt: new Date(),
        evaluacionFinalizada: false,
        evaluacionesRealizadas: 0,
      });

      await fetchProfiles(userId);
      setShowModal(false);

      // Mostrar notificación personalizada
      toast(
        <div>
          <p className="font-semibold mb-2">¡Perfil creado exitosamente!</p>
          <p className="text-sm mb-3">
            ¿Deseas realizar la evaluación inicial ahora?
          </p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => toast.dismiss()}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
            >
              Después
            </button>
            <button
              onClick={() => {
                toast.dismiss();
                navigate("/evaluation", {
                  state: {
                    profileId: docRef.id,
                    isNewProfile: true,
                  },
                });
              }}
              className="px-3 py-1 text-sm bg-[var(--primary-blue)] text-white rounded-md hover:opacity-90"
            >
              Iniciar
            </button>
          </div>
        </div>,
        {
          position: "top-center",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          closeButton: false,
          className: "bg-white rounded-lg shadow-lg",
        }
      );
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error("Error al crear el perfil");
    }
  };

  const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return "";

    const fechaNac = new Date(fechaNacimiento);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    return edad;
  };

  const handleEditProfile = async (updatedData) => {
    try {
      const userId = auth.currentUser.uid;

      // Calcula la edad basada en la fecha de nacimiento
      const birthDate = new Date(updatedData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      // Verifica si la edad está en el rango permitido
      if (age < 3 || age > 17) {
        toast.error("La edad debe estar entre 3 y 17 años");
        return;
      }

      await updateDoc(doc(db, "childProfiles", selectedProfile.id), {
        ...updatedData,
        updatedAt: new Date(),
      });

      await fetchProfiles(userId);
      setShowEditModal(false);
      setSelectedProfile(null);
      toast.success("Perfil actualizado exitosamente");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error al actualizar el perfil");
    }
  };

  const handleDeleteProfile = async (profileId) => {
    try {
      await deleteDoc(doc(db, "childProfiles", profileId));
      await fetchProfiles(auth.currentUser.uid);
      setShowEditModal(false);
      setSelectedProfile(null);
      toast.success("Perfil eliminado exitosamente");
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast.error("Error al eliminar el perfil");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--primary-yellow)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-blue)]"></div>
          <p className="mt-4 text-[var(--primary-blue)]">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--primary-yellow)]">
      <nav className="bg-[var(--primary-blue)] p-4">
        <div className="flex items-center justify-between w-full">
          <Link to="/profile-selection" className="flex items-center">
            <img src={banner} alt="Pequeños Genios" className="h-12" />
            <span className="text-white ml-2 text-xl font-bold">
              PEQUEÑOS GENIOS
            </span>
          </Link>

          <div className="relative">
            <NotificationIndicator
              onOpenCenter={() => navigate("/notificaciones")}
            />
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center space-x-2 text-white hover:opacity-80"
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[var(--primary-blue)] font-bold">
                {tutorName.charAt(0).toUpperCase()}
              </div>
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-8">
        <div className="bg-[#F8F9FA] rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[var(--primary-blue)] mb-4">
              ¡Bienvenido, {tutorName}!
            </h2>
            <p className="text-gray-600 text-lg">
              Estamos emocionados de comenzar este viaje contigo y tu pequeño
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                {profiles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="mb-4 text-6xl">👶</div>
                    <button
                      onClick={() => setShowModal(true)}
                      className="bg-[var(--primary-blue)] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all font-medium text-lg shadow-lg flex items-center gap-2"
                    >
                      <span className="text-xl">+</span>
                      Crear Primer Perfil
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-[var(--primary-blue)]">
                        Perfiles de los niños
                      </h3>
                      <button
                        onClick={() => setShowModal(true)}
                        className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all font-medium flex items-center gap-2"
                      >
                        <span>+</span>
                        Agregar Perfil
                      </button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4">
                      {profiles.map((profile) => (
                        <div
                          key={profile.id}
                          onClick={() => {
                            if (profile.evaluacionFinalizada) {
                              navigate("/console", {
                                state: { profileId: profile.id },
                              });
                            }
                          }}
                          className={`bg-gray-50 p-6 rounded-lg transition-all relative ${
                            profile.evaluacionFinalizada
                              ? "hover:shadow-lg hover:border-[var(--primary-blue)] hover:border cursor-pointer group"
                              : ""
                          }`}
                        >
                          <div className="flex items-start space-x-6">
                            <div
                              className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold
                   ${
                     profile.evaluacionFinalizada
                       ? "group-hover:scale-105 transition-transform"
                       : ""
                   }`}
                              style={{
                                backgroundColor:
                                  profile.avatar?.color || "#E5E7EB",
                                color: "#333",
                              }}
                            >
                              {profile.avatar?.initials ||
                                profile.fullName?.charAt(0) ||
                                "?"}
                            </div>
                            <div className="flex-1 space-y-2">
                              <h4 className="font-bold text-lg">
                                {profile.fullName}
                              </h4>
                              <p className="text-gray-600 text-sm">
                                Edad: {calcularEdad(profile.birthDate)} años
                              </p>
                              <p className="text-gray-600 text-sm">
                                Diagnóstico: {profile.primaryDiagnosis}
                              </p>

                              <div className="flex items-center justify-between mt-4">
                                <div>
                                  {!profile.evaluacionFinalizada ? (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate("/evaluation", {
                                          state: { profileId: profile.id },
                                        });
                                      }}
                                      className="px-4 py-2 bg-[var(--primary-blue)] text-white rounded-lg hover:opacity-90"
                                    >
                                      Realizar Evaluación Inicial
                                    </button>
                                  ) : (
                                    <span className="text-[var(--primary-blue)] flex items-center gap-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-all">
                                      <span>Acceder a la consola</span>
                                      {/*<span className="text-lg">→</span>*/}
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedProfile(profile);
                                      setShowEditModal(true);
                                    }}
                                    className="px-4 py-2 bg-gray-100 text-[var(--primary-blue)] rounded-lg 
                     hover:bg-[var(--primary-blue)] hover:text-white transition-all ml-4"
                                  >
                                    Editar
                                  </button>
                                </div>
                              </div>
                            </div>

                            {}
                            {profile.evaluacionFinalizada && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all">
                                <div className="text-[var(--primary-blue)] text-2xl">
                                  →
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-[var(--primary-blue)] mb-4">
                  Tu viaje con Pequeños Genios
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <span className="bg-[var(--primary-blue)] text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1">
                      1
                    </span>
                    <div>
                      <h4 className="font-bold">Crea el perfil</h4>
                      <p className="text-sm text-gray-600">
                        Personaliza la experiencia para tu niño
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-[var(--primary-blue)] text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1">
                      2
                    </span>
                    <div>
                      <h4 className="font-bold">Evaluación inicial</h4>
                      <p className="text-sm text-gray-600">
                        Conoceremos mejor sus necesidades
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-[var(--primary-blue)] text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1">
                      3
                    </span>
                    <div>
                      <h4 className="font-bold">¡A jugar y aprender!</h4>
                      <p className="text-sm text-gray-600">
                        Comienza la aventura del aprendizaje
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-[var(--primary-blue)] mb-4 text-center">
                  ¿Qué podrás hacer?
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-4xl mr-4">🎮</div>
                    <div>
                      <h4 className="font-bold">Juegos Educativos</h4>
                      <p className="text-sm text-gray-600">
                        Actividades divertidas y educativas adaptadas a cada
                        nivel
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-4xl mr-4">📊</div>
                    <div>
                      <h4 className="font-bold">Seguimiento Detallado</h4>
                      <p className="text-sm text-gray-600">
                        Monitorea el progreso y desarrollo de tu niño
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-4xl mr-4">🎯</div>
                    <div>
                      <h4 className="font-bold">Objetivos Personalizados</h4>
                      <p className="text-sm text-gray-600">
                        Establece y alcanza metas específicas
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-[var(--primary-yellow)] p-4 rounded-lg">
                  <h4 className="font-bold mb-2">💡 ¿Sabías que?</h4>
                  <p className="text-sm">
                    Las actividades personalizadas pueden mejorar
                    significativamente el desarrollo cognitivo de los niños con
                    TDAH.
                  </p>
                </div>
                <div className="bg-[var(--primary-yellow)] p-4 rounded-lg">
                  <h4 className="font-bold mb-2">🎯 Tip del día</h4>
                  <p className="text-sm">
                    Establece rutinas diarias para ayudar a tu niño a mantenerse
                    organizado y enfocado en sus actividades.
                  </p>
                </div>
                <div className="bg-[var(--primary-yellow)] p-4 rounded-lg">
                  <h4 className="font-bold mb-2">🌟 Logro del Día</h4>
                  <p className="text-sm">
                    Celebra los pequeños avances. Cada paso cuenta en el
                    desarrollo de tu pequeño.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddProfileModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateProfile}
      />

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProfile(null);
        }}
        onSubmit={handleEditProfile}
        onDelete={handleDeleteProfile}
        profile={selectedProfile}
        onEvaluate={(profileId) =>
          navigate("/evaluation", { state: { profileId } })
        }
      />

      <ToastContainer />
    </div>
  );
}

export default ProfileSelection;
