import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ArrowLeft, Users, Shield, UserPlus, LogOut, Loader2, AlertCircle } from "lucide-react";
import defaultImg from "../assets/defaultUser.png";
import axios from "axios";
import { baseurl } from "../../address/address";
import { deleteGroup } from "../../redux/chatSlice";

function GroupProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false); 

  const currentUser = useSelector((state) => state.auth.user);
  const onlineUsers = useSelector((state) => state.socket.onlineUsers) || [];

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const res = await axios.get(`${baseurl}/group/${id}`, {
          withCredentials: true,
        });
        if (res.data.success) {
          setGroup(res.data.group);
        }
      } catch (err) {
        console.error("Failed to fetch group details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [id]);

  async function handleLeaveGroup() {
    try {
      const res = await axios.get(`${baseurl}/delete-group/${id}`, {
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(deleteGroup(id));
        
        navigate("/"); 
      }
    } catch (err) {
      console.error("Leave group failed", err);
    } finally {
      setShowPopup(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white relative">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-neutral-400 font-medium tracking-widest uppercase text-sm">Loading Profile...</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-8 left-8 p-3 bg-neutral-900 hover:bg-neutral-800 rounded-full text-white transition-all duration-200"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-neutral-400 font-medium tracking-widest uppercase">
          Group not found
        </div>
      </div>
    );
  }

  const isUserAdmin = (userId) => {
    return group.admins?.some((admin) => String(admin._id || admin) === String(userId));
  };


  return (
    <>
      <div className="select-none min-h-screen w-full bg-black flex flex-col items-center p-4 sm:p-8 relative">
        
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 md:top-8 md:left-8 p-3 bg-neutral-900/80 hover:bg-neutral-800 rounded-full text-white backdrop-blur-md transition-all duration-200 shadow-lg z-50"
        >
          <ArrowLeft className="w-6 h-6 md:w-5 md:h-5" />
        </button>

        <div className="w-full max-w-md bg-[#111111] rounded-[2rem] border border-neutral-800 shadow-2xl overflow-hidden relative pb-6">
          
          <div className="h-36 bg-gradient-to-tr from-blue-700 via-indigo-600 to-purple-600 opacity-90 relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
          </div>

          <div className="px-6 flex flex-col items-center relative -mt-16">
            
            <div className="relative mb-4">
              <img
                src={group.logo || defaultImg}
                alt="Group Logo"
                className="w-32 h-32 rounded-full object-cover border-[6px] border-[#111111] bg-neutral-900 shadow-xl"
              />
              <div className="absolute bottom-1 right-2 w-8 h-8 bg-neutral-800 border-[3px] border-[#111111] rounded-full flex items-center justify-center">
                <Users size={14} className="text-blue-400" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white tracking-tight text-center px-4">
              {group.groupName}
            </h2>
            <p className="text-neutral-500 text-sm font-medium mt-1">
              Group • {group.members?.length || 0} members
            </p>

            <div className="flex w-full gap-3 mt-6 border-b border-neutral-800/50 pb-6">
              
              <button 
                onClick={() => setShowPopup(true)}
                className="flex-1 flex flex-col items-center gap-2 p-3 rounded-2xl bg-neutral-900 hover:bg-red-500/10 border border-neutral-800 transition-all text-red-500 hover:text-red-400"
              >
                <LogOut size={22} />
                <span className="text-xs font-semibold">Leave</span>
              </button>
            </div>

            <div className="w-full mt-6">
              <h3 className="text-xs font-bold text-neutral-500 tracking-wider mb-4 uppercase pl-1">
                Members
              </h3>

              <div className="space-y-1 max-h-[350px] overflow-y-auto webkit-scrollbar pr-1">
                {group.members?.map((member) => {
                  const isOnline = onlineUsers.includes(member._id) && member._id !== currentUser._id;
                  const isAdmin = isUserAdmin(member._id);
                  const isMe = member._id === currentUser._id;

                  return (
                    <div 
                      key={member._id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-900/50 transition-colors"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={member.profilePhoto || defaultImg}
                          alt={member.username}
                          className="w-12 h-12 rounded-full object-cover border border-neutral-800"
                        />
                        {isOnline && (
                          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-[#111111] rounded-full shadow-sm" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-center justify-between">
                          <p className="text-white font-medium truncate text-[15px]">
                            {isMe ? "You" : member.username}
                          </p>
                          {isAdmin && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400">
                              <Shield size={10} />
                              <span className="text-[10px] font-bold tracking-wide uppercase">Admin</span>
                            </div>
                          )}
                        </div>
                        <p className="text-neutral-500 text-xs truncate mt-0.5">
                          {member.about || "Hey there! I am using Nexus."}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>

      {showPopup && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={() => setShowPopup(false)} 
        >
          <div 
            className="bg-[#111111] border border-neutral-800 rounded-[2rem] p-6 sm:p-8 w-full max-w-sm shadow-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()} 
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 border border-red-500/20">
                <AlertCircle className="w-8 h-8 text-red-500" strokeWidth={2} />
              </div>
              
              <h3 className="text-white text-xl font-bold mb-2 tracking-tight">
                Leave Group?
              </h3>
              
              <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
                Are you sure you want to leave <span className="text-white font-semibold">{group?.groupName}</span>? You will not receive any more messages.
              </p>

              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowPopup(false)}
                  className="flex-1 py-3.5 rounded-xl bg-transparent border border-neutral-700 text-white font-semibold hover:bg-neutral-800 transition-all duration-200 active:scale-[0.98]"
                >
                  Cancel
                </button>

                <button
                  onClick={handleLeaveGroup}
                  className="flex-1 py-3.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-500 shadow-lg shadow-red-600/20 transition-all duration-200 active:scale-[0.98]"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GroupProfilePage;