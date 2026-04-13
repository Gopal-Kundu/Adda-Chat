import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import defaultGroupImg from "../assets/defaultUser.png";
import { Trash2, Users, AlertCircle } from "lucide-react";
import axios from "axios";
import { baseurl } from "../../address/address";
import { useDispatch } from "react-redux";
import { deleteGroup } from "../../redux/chatSlice";

function GroupChats({ id, groupName, logo, newMsgCount }) {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const dispatch = useDispatch();

  function openGroupChat() {
    navigate(`/group-chat/${id}`);
  }

  async function handleDeleteGroup() {
    try {
      const res = await axios.get(`${baseurl}/delete-group/${id}`, {
        withCredentials: true,
      });

      if (res.data.success) {
        dispatch(deleteGroup(id));
      }
    } catch (err) {
      console.error("Delete group failed", err);
    } finally {
      setShowPopup(false);
    }
  }

  return (
    <>
      <div 
        onClick={openGroupChat}
        className="group select-none cursor-pointer flex items-center gap-4 px-5 py-3.5 w-full bg-transparent hover:bg-neutral-900/80 transition-all duration-300 border-b border-neutral-800/50"
      >
        <div className="relative shrink-0">
          <Link 
            to={`/group-profile/${id}`} 
            onClick={(e) => e.stopPropagation()}
            className="block"
          >
            <div className="h-12 w-12 rounded-full overflow-hidden border border-neutral-700 group-hover:border-neutral-500 transition-colors shadow-sm">
              <img
                src={logo || defaultGroupImg}
                alt="Group"
                className="h-full w-full object-cover"
              />
            </div>
          </Link>
          <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-neutral-800 rounded-full flex items-center justify-center border-2 border-black pointer-events-none">
            <Users size={10} className="text-blue-400" />
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-white font-semibold text-lg tracking-wide truncate">
            {groupName}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {newMsgCount > 0 && (
            <div className="min-w-[24px] h-[24px] px-1.5 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20">
              {newMsgCount}
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowPopup(true);
            }}
            className="p-2.5 rounded-full text-neutral-500 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 focus:opacity-100"
          >
            <Trash2 size={18} strokeWidth={2.5} />
          </button>
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
                Are you sure you want to leave <span className="text-white font-semibold">{groupName}</span>? You will not receive any more messages.
              </p>

              <div className="flex w-full gap-3">
                <button
                  onClick={() => setShowPopup(false)}
                  className="flex-1 py-3.5 rounded-xl bg-transparent border border-neutral-700 text-white font-semibold hover:bg-neutral-800 transition-all duration-200 active:scale-[0.98]"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteGroup}
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

export default GroupChats;