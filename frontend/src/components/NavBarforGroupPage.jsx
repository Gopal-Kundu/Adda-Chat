import React from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import defaultImg from "../assets/defaultUser.png";

function NavBarforGroupPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const groups = useSelector((state) => state.chat.groups) || [];

  const specificGroup = groups.find((c) => c._id === id);

  const logo = specificGroup?.logo;
  const name = specificGroup?.groupName || "Group";

  function navigateToChatScreen() {
    navigate("/");
  }

  return (
    <div className="select-none sticky z-[10] top-0">
      <div className="p-2 flex items-center flex-row h-[8vh] md:h-[12vh] bg-indigo-400 shadow-md">
        
        <button 
          onClick={navigateToChatScreen}
          className="p-2 rounded-full hover:bg-white/20 transition-colors active:scale-95"
        >
          <ArrowLeft className="text-white size-7 md:size-8" />
        </button>

        <div className="relative ml-2">
          <Link to={`/group-profile/${id}`}>
            <div className="border-white/80 h-11 w-11 rounded-full overflow-hidden border-2 cursor-pointer hover:border-white transition-colors shadow-sm">
              <img
                src={logo || defaultImg}
                alt="Group Logo"
                className="h-full w-full object-cover bg-white"
              />
            </div>
          </Link>
        </div>

        <div className="flex-1">
          <Link to={`/group-profile/${id}`}>
            <div className="overflow-hidden cursor-pointer ml-4 text-white font-bold inter text-xl hover:text-white/90 transition-colors truncate">
              {name}
            </div>
          </Link>
        </div>
        
      </div>
    </div>
  );
}

export default NavBarforGroupPage;