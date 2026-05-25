import SendIcon from "@/src/components/store/icons/send";

export default function Newsletter() {
  return (
    <div className="bg-[#95CFB2] p-5">
      <div className="max-w-[1430px] mx-auto">
        <div className="flex flex-col gap-y-4 xl:flex-row items-center text-white">
          {/* Left */}
          <div className="flex items-center xl:w-[58%]">
            <h5 className="flex items-center gap-x-2">
              <div className="scale-125 mr-2">
                <SendIcon />
              </div>
              <span className="md:text-xl font-semibold">Sign up to Newsletter</span>
              <span className="ml-10">
                ...and receive &nbsp;
                <b>$10 coupon for first shopping</b>
              </span>
            </h5>
          </div>
          {/* Right */}
          <div className="flex w-full xl:flex-1">
            <input
              type="text"
              placeholder="Enter your email address"
              className="w-full h-10 pl-6 bg-white/40 border border-black/20 text-white placeholder:text-white/70 rounded-l-full outline-none"
            />
            <span className="h-10 w-24 text-sm grid place-content-center rounded-r-full bg-black text-white cursor-pointer">
              Sign up
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}