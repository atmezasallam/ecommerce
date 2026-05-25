import { getSubcategories } from "@/src/queries/subCategory";
import Contact from "@/src/components/store/layout/footer/contact";
import Links from "@/src/components/store/layout/footer/links";
import Newsletter from "@/src/components/store/layout/footer/newsletter";

export default async function Footer() {
  const subs = await getSubcategories(7, true);
  return (
    <div className="w-full bg-surface">
      <Newsletter />
      <div className="max-w-[1430px] mx-auto">
        <div className="p-5">
          <div className="grid md:grid-cols-2 md:gap-x-5">
            <Contact />
            <Links subs={subs} />
          </div>
        </div>
      </div>
      <div className="bg-[#95CFB2] px-4 py-3 text-[#2d6b54]">
        <div className="mx-auto flex max-w-[1430px] flex-col items-center justify-between gap-2 text-sm sm:flex-row">
          <span>
            <b>© Salamo</b> - All Rights Reserved
          </span>
          <a
            href="mailto:info@salamo.ps"
            className="font-medium hover:underline"
          >
            info@salamo.ps
          </a>
        </div>
      </div>
    </div>
  );
}